import * as Storage from './storage.js';

let allWords = [];
let filteredWords = [];
const BATCH_SIZE = 50;
let renderLimit = BATCH_SIZE;

export function initDictionary() {
    const searchInput = document.getElementById('dict-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterDictionary(e.target.value);
        });
    }

    // Scroll listener for infinite scroll
    const listEl = document.getElementById('dict-list');
    const screenEl = document.getElementById('dictionary-screen');

    // We bind scroll on the screen container because it handles the overflow
    screenEl.addEventListener('scroll', () => {
        if (screenEl.scrollTop + screenEl.clientHeight >= screenEl.scrollHeight - 100) {
            loadMore();
        }
    });
}

export function loadDictionary() {
    const db = Storage.getDB();
    allWords = [...db.words]; // Copy
    filteredWords = allWords;
    renderLimit = BATCH_SIZE;

    // Clear Input
    const searchInput = document.getElementById('dict-search');
    if (searchInput) searchInput.value = '';

    renderList();
}

function filterDictionary(query) {
    const q = query.toLowerCase().trim();

    if (!q) {
        filteredWords = allWords;
    } else {
        filteredWords = allWords.filter(w => {
            const front = w.word.toLowerCase();
            const back = w.def.toLowerCase();
            const tags = (w.tags || []).join(' ').toLowerCase();

            return front.includes(q) || back.includes(q) || tags.includes(q);
        });
    }

    renderLimit = BATCH_SIZE;
    renderList();
}

function loadMore() {
    if (renderLimit < filteredWords.length) {
        renderLimit += BATCH_SIZE;
        renderList(true); // append mode
    }
}

function renderList(append = false) {
    const listEl = document.getElementById('dict-list');
    if (!listEl) return;

    if (!append) listEl.innerHTML = '';

    const count = Math.min(renderLimit, filteredWords.length);
    // If append is true, we need to start from previous limit... 
    // Actually simpler to just clear and re-render or slice properly.
    // For performance, let's just slice the new batch if appending.

    let startIdx = 0;
    if (append) {
        startIdx = renderLimit - BATCH_SIZE;
        // Safety check
        if (startIdx < 0) startIdx = 0;
    }

    const fragment = document.createDocumentFragment();

    for (let i = startIdx; i < count; i++) {
        const w = filteredWords[i];
        const card = document.createElement('div');
        card.className = 'dict-card';
        card.onclick = () => window.app.openDetail(w.id);

        // infer POS Color
        const color = getPOSColor(w.tags);
        card.style.borderLeftColor = color;

        // Tags HTML
        const tagsHtml = (w.tags || []).slice(0, 3).map(t =>
            `<span class="dict-tag">${t}</span>`
        ).join('');

        card.innerHTML = `
            <div class="dict-main">
                <div class="dict-front">${w.word}</div>
                <div class="dict-back">${w.def}</div>
            </div>
            <div class="dict-tags">
                ${tagsHtml}
            </div>
        `;
        fragment.appendChild(card);
    }

    if (filteredWords.length === 0) {
        listEl.innerHTML = `
            <div style="text-align:center; padding: 40px; color: #94a3b8;">
                <div style="font-size: 3rem; margin-bottom: 10px;">🔍</div>
                <p>No words found.</p>
            </div>
        `;
    } else {
        listEl.appendChild(fragment);
    }
}

function getPOSColor(tags) {
    if (!tags) return '#94a3b8'; // Gray
    const t = tags.map(x => x.toLowerCase());
    if (t.includes('noun')) return '#3b82f6'; // Blue
    if (t.includes('verb')) return '#ef4444'; // Red
    if (t.includes('adj') || t.includes('adjective')) return '#22c55e'; // Green
    return '#94a3b8';
}
