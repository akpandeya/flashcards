/**
 * LingoFlow Core Logic (Modular)
 */
import * as Storage from './storage.js';
import * as SRS from './srs.js';

let sessionQueue = [];
let currentIndex = 0;
let isFlipped = false;

// --- INIT ---
Storage.load();
updateDashboard();
// Auto-fetch logic could be here, or triggered by UI
fetchCentralVocabulary(false);

// --- UI HELPERS ---
function showToast(msg, icon = '✨') {
    const t = document.getElementById('toast');
    if (!t) return;
    document.getElementById('toast-msg').innerText = msg;
    const iconEl = document.querySelector('.toast-icon');
    if (iconEl) iconEl.innerText = icon;
    t.classList.add('visible');
    setTimeout(() => t.classList.remove('visible'), 3000);
}

function updateDashboard() {
    const db = Storage.getDB();
    const total = db.words.length;

    // "Due" calculation based on SRS
    const now = Date.now();
    const dueCount = db.words.filter(w => {
        const p = db.progress[w.id];
        if (!p) return true; // New words are due
        return p.dueDate <= now;
    }).length;

    document.getElementById('total-val').innerText = total;
    document.getElementById('due-val').innerText = dueCount;

    const btn = document.getElementById('btn-start');
    if (dueCount === 0 && total > 0) {
        btn.disabled = false; // Allow review anyway? Or disable?
        // Anki usually allows "Custom Study" but for now let's say "Zero Due"
        // But users might want to review ahead.
        // Let's keep it simple: If 0 due, maybe show "Review Ahead"?
        // Or just disable as per original spec "All Learned".
        // With SRS, "All Learned" isn't quite right. "No Due Cards".

        // Let's allow users to start session even if 0 due, maybe pulling ahead?
        // Or just disabled. Let's stick to disabled for now to encourage spacing.
        btn.innerHTML = `<span>🎉</span> No Due Cards`;
        btn.disabled = true;
        btn.classList.add('finished');
    } else if (total === 0) {
        btn.disabled = true;
        btn.innerHTML = `Add words to start`;
    } else {
        btn.disabled = false;
        btn.classList.remove('finished');
        btn.innerHTML = `<span>▶</span> Review (${dueCount})`;
    }

    // Update Tag Datalist
    if (window.getUniqueTags) updateTagList(); // Helper below
    else updateTagList();
}

function updateTagList() {
    const db = Storage.getDB();
    const tags = new Set();
    db.words.forEach(w => {
        if (w.tags) w.tags.forEach(t => tags.add(t));
    });
    const sortedTags = Array.from(tags).sort();

    const dl = document.getElementById('tag-suggestions');
    if (dl) {
        dl.innerHTML = '';
        sortedTags.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            dl.appendChild(opt);
        });
    }
}

// --- CORE ACTIONS ---

function startSession() {
    const db = Storage.getDB();
    const tagFilter = document.getElementById('tag-filter').value.trim();
    const now = Date.now();

    // SRS Logic: 
    // 1. Due Today (p.dueDate <= now)
    // 2. New words (no progress)

    sessionQueue = db.words.filter(w => {
        const p = db.progress[w.id];

        let isDue = false;
        if (!p) isDue = true; // New
        else if (p.dueDate <= now) isDue = true; // Due

        if (tagFilter) {
            return isDue && w.tags && w.tags.includes(tagFilter);
        }
        return isDue;
    });

    if (sessionQueue.length === 0) {
        showToast("No cards due right now!", '✅');
        return;
    }

    // Sort: New words first? Or mixed? Or random?
    // Anki usually mixes. Let's shuffle for now.
    // If we want SRS strictness, maybe due date ascending?
    // Let's user random to keep it simple and fun.
    for (let i = sessionQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sessionQueue[i], sessionQueue[j]] = [sessionQueue[j], sessionQueue[i]];
    }

    currentIndex = 0;
    isFlipped = false;
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('review-screen').classList.remove('hidden');
    renderCard();
}

function renderCard() {
    if (currentIndex >= sessionQueue.length) {
        showToast("Session Complete!", '🏆');
        goHome();
        return;
    }

    const card = sessionQueue[currentIndex];
    const cleanPos = (card.pos || '').split('#')[0];

    // Reset Flip
    isFlipped = false;
    document.getElementById('active-card').classList.remove('flipped');

    // Hide buttons, show "Show Answer"? 
    // Usually Anki shows "Show Answer" then the buttons.
    // Our existing UI flips on click. So we should show buttons ONLY after flip?
    // Let's assume buttons are visible but disabled or user knows to flip first?
    // Better: Hide buttons until flip.
    document.querySelector('.controls').style.opacity = '0';
    document.querySelector('.controls').style.pointerEvents = 'none';

    // Populate
    document.getElementById('card-word').innerText = card.word;
    document.getElementById('card-pos').innerText = cleanPos;

    // Back Side
    document.getElementById('card-def').innerText = card.def;
    document.getElementById('card-ex-de').innerText = card.ex_de;
    document.getElementById('card-ex-en').innerText = card.ex_en;

    // Progress
    document.getElementById('progress-indicator').innerText =
        `${currentIndex + 1} / ${sessionQueue.length}`;
}

function flip() {
    isFlipped = !isFlipped;
    document.getElementById('active-card').classList.toggle('flipped');

    if (isFlipped) {
        document.querySelector('.controls').style.opacity = '1';
        document.querySelector('.controls').style.pointerEvents = 'auto';
    }
}

// Answer with Grade (0-5)
// Maps directly to SRS.Grades
function answer(grade) {
    if (!isFlipped) return; // Prevention

    const card = sessionQueue[currentIndex];
    const db = Storage.getDB();
    const currentProgress = db.progress[card.id];

    const nextState = SRS.calculateNextState(currentProgress, grade);
    Storage.updateProgress(card.id, nextState);

    // If grade is AGAIN (0), re-queue it?
    // Anki re-queues "Again" cards in the same session usually (learning steps).
    // Simple version: Grade 0 -> repetition 0 -> interval 1 day. 
    // It's considered "reviewed" but "failed".
    // If we want "Same Session" review, we push it to end of queue.
    if (grade === SRS.Grades.AGAIN) {
        sessionQueue.push(card);
        // Update total indicator?
        document.getElementById('progress-indicator').innerText =
            `${currentIndex + 1} / ${sessionQueue.length}`;
    }

    currentIndex++;
    setTimeout(() => renderCard(), 150);
}

function speak() {
    const word = sessionQueue[currentIndex].word;
    const ut = new SpeechSynthesisUtterance(word);
    ut.lang = 'de-DE';
    window.speechSynthesis.speak(ut);
}

function goHome() {
    document.getElementById('review-screen').classList.add('hidden');
    document.getElementById('dictionary-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    updateDashboard();
}

function handleCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        const words = Storage.parseCSVData(evt.target.result);
        const res = Storage.mergeWords(words);
        if (res.added > 0) showToast(res.message, '📥');
        else showToast(res.message, 'Hz');

        updateDashboard();
        e.target.value = '';
    };
    reader.readAsText(file);
}

function fetchCentralVocabulary(manual = false) {
    fetch('data/vocabulary.csv')
        .then(response => {
            if (!response.ok) throw new Error("CSV not found");
            return response.text();
        })
        .then(text => {
            const words = Storage.parseCSVData(text);
            if (manual) {
                const res = Storage.mergeWords(words);
                if (res.added > 0) showToast(res.message, '📥');
                else showToast(res.message, 'Hz');
                updateDashboard();
            } else {
                // Auto-load silent merge
                Storage.mergeWords(words, false);
                updateDashboard();
            }
        })
        .catch(err => {
            console.error(err);
            if (manual) showToast("Update failed", '❌');
        });
}

// --- DICTIONARY ---
function openDictionary() {
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('dictionary-screen').classList.remove('hidden');
    renderList();
}

function renderList(query = "") {
    const db = Storage.getDB();
    const container = document.getElementById('word-list-container');
    container.innerHTML = "";

    const q = query.toLowerCase();
    const matches = db.words.filter(w =>
        w.word.toLowerCase().includes(q) ||
        w.def.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:20px;">No words found</div>`;
        return;
    }

    // Limit render for performance?
    matches.slice(0, 100).forEach(w => {
        const el = document.createElement('div');
        el.className = 'list-item';

        // Progress Info
        const p = db.progress[w.id];
        let progBadge = '';
        if (p) {
            const nextDate = new Date(p.dueDate).toLocaleDateString();
            const rep = p.repetition;
            progBadge = `<span style="font-size:0.7rem; color:var(--success); border:1px solid var(--success); padding:2px 6px; border-radius:4px; margin-left:8px;">Lvl ${rep} • ${nextDate}</span>`;
        }

        const tagHtml = w.tags && w.tags.length > 0
            ? `<br><span style="font-size:0.75rem; color:var(--primary); opacity:0.8;">🏷 ${w.tags.join(', ')}</span>`
            : '';

        el.innerHTML = `
            <div class="li-main">
                <div class="li-word">${w.word} <span style="font-size:0.8rem; opacity:0.6; font-weight:400; margin-left:8px;">${w.pos}</span>${progBadge}</div>
                <div class="li-def">${w.def}${tagHtml}</div>
            </div>
            <div class="li-actions">
                <button class="btn-mini" onclick="app.speakWord('${w.word}')" title="Pronounce">🔊</button>
                <button class="btn-mini del" onclick="app.deleteWord('${w.id}')" title="Delete">🗑</button>
            </div>
        `;
        container.appendChild(el);
    });
}

function search(val) {
    renderList(val);
}

function deleteWord(id) {
    if (!confirm("Delete this word permanently?")) return;

    // We need to manipulate DB directly or via Storage helper
    // Let's add delete helper properly, but for now:
    const db = Storage.getDB();
    db.words = db.words.filter(w => w.id !== id);
    delete db.progress[id];
    Storage.save();

    const searchVal = document.querySelector('.search-bar').value;
    renderList(searchVal);
    updateDashboard();
    showToast("Word deleted", '🗑');
}

function speakWord(text) {
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang = 'de-DE';
    window.speechSynthesis.speak(ut);
}

function backup() {
    const db = Storage.getDB();
    const str = JSON.stringify(db);
    const blob = new Blob([str], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingoflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function handleRestore(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const data = JSON.parse(evt.target.result);
            if (data.words && data.progress) {
                if (confirm("Replace current data with this backup?")) {
                    Storage.setDB(data);
                    updateDashboard();
                    showToast("Data restored!", '↺');
                }
            } else {
                alert("Invalid file format");
            }
        } catch (err) {
            alert("Error reading file");
        }
        e.target.value = '';
    };
    reader.readAsText(file);
}

function clearData() {
    if (confirm("⚠ Are you sure you want to delete all words and progress?")) {
        Storage.clearData();
        updateDashboard();
        showToast("Database wiped", '🗑');
    }
}

function installPWA() {
    // PWA Logic ... needs to be attached to window logic or re-implemented here
    // Deferred prompt is window level usually.
    if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((result) => {
            if (result.outcome === 'accepted') {
                document.getElementById('btn-install').classList.add('hidden');
            }
            window.deferredPrompt = null;
        });
    }
}

// Global PWA prompt handler
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    const btn = document.getElementById('btn-install');
    if (btn) btn.classList.remove('hidden');
});


// EXPORT GLOBAL
const app = {
    startSession, handleCSV, backup, handleRestore,
    clearData, flip, answer, speak, goHome,
    openDictionary, search, deleteWord, speakWord,
    fetchCentralVocabulary, installPWA,
    // Expose constants for HTML usage if needed? 
    // Better to have simple methods like answerAgain(), answerHard()...
    answerAgain: () => answer(0), // Again
    answerHard: () => answer(3),  // Hard
    answerGood: () => answer(4),  // Good
    answerEasy: () => answer(5)   // Easy
};

window.app = app;
