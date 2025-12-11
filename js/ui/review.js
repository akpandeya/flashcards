/**
 * Review UI Module
 * Handles the Flashcard Session (SRS Logic, Render, Interaction).
 */
import { store } from '../state.js';
import * as SRS from '../core/srs.js';

let sessionQueue = [];
let currentIndex = 0;
let isFlipped = false;

// We might need a callback to return to home
let onSessionUnmount = null;

export function init(unmountCallback) {
    onSessionUnmount = unmountCallback;
}

export function startSession() {
    const state = store.state;
    // We read the active filter from the store
    const filterTags = state.settings.activeFilter || [];
    const now = Date.now();

    // SRS Logic: 
    // 1. Due Today (p.dueDate <= now)
    // 2. New words (no progress)
    // 3. RESPECT GLOBAL FILTER

    sessionQueue = state.words.filter(w => {
        // 1. Check Filter (OR Logic)
        if (filterTags.length > 0) {
            if (!w.tags) return false;
            const hasTag = filterTags.some(t => w.tags.includes(t));
            if (!hasTag) return false;
        }

        const p = state.progress[w.id];
        let isDue = false;
        if (!p) isDue = true; // New
        else if (p.dueDate <= now) isDue = true; // Due

        return isDue;
    });

    if (sessionQueue.length === 0) {
        // We need a way to show Toast. 
        // For now, let's assume a global 'showToast' or we import a Utils module.
        // Or simpler: just return false and let Caller handle message.
        // But for direct migration, let's assume we can trigger UI.
        alert("No cards due!"); // Temporary fallback
        return false;
    }

    // Shuffle
    for (let i = sessionQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sessionQueue[i], sessionQueue[j]] = [sessionQueue[j], sessionQueue[i]];
    }

    currentIndex = 0;
    isFlipped = false;

    // Switch View
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('dictionary-screen').classList.add('hidden');
    document.getElementById('review-screen').classList.remove('hidden');

    renderCard();
    return true;
}

export function renderCard() {
    if (currentIndex >= sessionQueue.length) {
        // Session Complete
        if (onSessionUnmount) onSessionUnmount();
        return;
    }

    const card = sessionQueue[currentIndex];
    const cleanPos = (card.pos || '').split('#')[0];

    // Reset Flip
    isFlipped = false;
    const cardEl = document.getElementById('active-card');
    if (cardEl) cardEl.classList.remove('flipped');

    // Controls hidden
    const ctrls = document.querySelector('.controls');
    if (ctrls) {
        ctrls.style.opacity = '0';
        ctrls.style.pointerEvents = 'none';
    }

    // Populate
    const wordEl = document.getElementById('card-word');
    if (wordEl) wordEl.innerText = card.word;

    const posEl = document.getElementById('card-pos');
    if (posEl) posEl.innerText = cleanPos;

    // Back Side
    const defEl = document.getElementById('card-def');
    if (defEl) defEl.innerText = card.def;

    // Examples (using fields for now)
    const exDeEl = document.getElementById('card-ex-de');
    if (exDeEl) exDeEl.innerText = card.ex_de || '';

    const exEnEl = document.getElementById('card-ex-en');
    if (exEnEl) exEnEl.innerText = card.ex_en || '';

    // Progress
    const progEl = document.getElementById('progress-indicator');
    if (progEl) progEl.innerText = `${currentIndex + 1} / ${sessionQueue.length}`;
}

export function flip() {
    isFlipped = !isFlipped;
    const cardEl = document.getElementById('active-card');
    if (cardEl) cardEl.classList.toggle('flipped');

    if (isFlipped) {
        const ctrls = document.querySelector('.controls');
        if (ctrls) {
            ctrls.style.opacity = '1';
            ctrls.style.pointerEvents = 'auto';
        }
    }
}

export function answer(grade) {
    if (!isFlipped) return;

    const card = sessionQueue[currentIndex];

    // Get current progress from store
    const currentProgress = store.state.progress[card.id];

    // Calculate new state
    const nextState = SRS.calculateNextState(currentProgress, grade);

    // Update Store
    store.updateWordProgress(card.id, nextState);

    // Update Stats (Streak)
    const today = new Date().toISOString().split('T')[0];
    const lastRev = store.state.stats.lastReviewDate
        ? new Date(store.state.stats.lastReviewDate).toISOString().split('T')[0]
        : null;

    if (lastRev !== today) {
        // Increment streak if it's a new day (and continuous? Logic handled in Dashboard update basically)
        // Simple logic: If last review was yesterday, streak++. If today, ignore. If older, streak=1.
        // Actually SRS updateStreak logic in app.js was a bit more complex.
        // Let's implement basic streak increment here for now.
        const prevStreak = store.state.stats.streak || 0;
        // Basic check: did we already bump streak today? 
        // Actually let's just set lastReviewDate. Dashboard calculates display.
        // Ideally we increment streak if valid.

        let newStreak = prevStreak;
        if (!lastRev) newStreak = 1;
        else {
            const diff = (new Date(today) - new Date(lastRev)) / (1000 * 60 * 60 * 24);
            if (diff === 1) newStreak++;
            else if (diff > 1) newStreak = 1;
        }

        store.updateStats({
            lastReviewDate: Date.now(),
            streak: newStreak
        });
    } else {
        // Just update timestamp
        store.updateStats({ lastReviewDate: Date.now() });
    }

    // Re-queue if AGAIN (0)
    if (grade === SRS.Grades.AGAIN) {
        sessionQueue.push(card);
        const progEl = document.getElementById('progress-indicator');
        if (progEl) progEl.innerText = `${currentIndex + 1} / ${sessionQueue.length}`;
    }

    currentIndex++;
    setTimeout(() => renderCard(), 150);
}

export function speak() {
    const card = sessionQueue[currentIndex];
    if (card && card.word) {
        const ut = new SpeechSynthesisUtterance(card.word);
        ut.lang = 'de-DE'; // Hardcoded for now, could be dynamic
        window.speechSynthesis.speak(ut);
    }
}
