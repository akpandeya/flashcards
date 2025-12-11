/**
 * Dashboard UI Module
 * Handles rendering the main dashboard, stats, and focus widget.
 */
import { store } from '../state.js';

let cachedTags = null; // Optimization cache for tags

export function init() {
    // Initial render
    update();

    // Bind Listeners
    const input = document.getElementById('focus-input');
    if (input) {
        input.addEventListener('input', (e) => handleFocusInput(e.target.value));
        input.addEventListener('focus', (e) => handleFocusInput(e.target.value));

        // Close dropdown on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.tag-input-container')) {
                const dd = document.getElementById('focus-suggestions');
                if (dd) dd.classList.add('hidden');
            }
        });
    }

    // Bind global events if needed, or return event handlers
    // specific DOM elements are bound in app.js or here? 
    // Ideally here if we move full ownership, but for now we export handlers.
}

export function update() {
    const state = store.state;
    const total = state.words.length;
    const filterTags = state.settings.activeFilter || [];

    // "Due" calculation based on SRS AND Filter
    const now = Date.now();
    const dueCount = state.words.filter(w => {
        // Filter Check (OR Logic)
        if (filterTags.length > 0) {
            if (!w.tags) return false;
            const hasTag = filterTags.some(t => w.tags.includes(t));
            if (!hasTag) return false;
        }

        const p = state.progress[w.id];
        if (!p) return true; // New words are due
        return p.dueDate <= now;
    }).length;

    // Update Focus UI
    renderFocusWidget();

    const dueEl = document.getElementById('due-val');
    if (dueEl) dueEl.innerText = dueCount;

    // Progress: Known words (Repetition > 0)
    const learned = state.words.filter(w => state.progress[w.id] && state.progress[w.id].repetition > 0).length;
    const pct = total > 0 ? Math.round((learned / total) * 100) : 0;

    const progBar = document.getElementById('total-progress');
    if (progBar) progBar.style.width = `${pct}%`;

    const progText = document.getElementById('progress-text');
    if (progText) progText.innerText = `${pct}%`;

    // Streak Logic
    let displayStreak = state.stats.streak || 0;
    if (state.stats.lastReviewDate) {
        const last = new Date(state.stats.lastReviewDate);
        last.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diff = (today - last) / (1000 * 60 * 60 * 24);

        if (diff > 1) {
            displayStreak = 0; // Streak broken
        }
    }
    const streakEl = document.getElementById('streak-val');
    if (streakEl) streakEl.innerText = displayStreak;

    // Start Button state
    updateStartButton(dueCount, total, filterTags);
}

function updateStartButton(dueCount, total, filterTags) {
    const btn = document.getElementById('btn-start');
    if (!btn) return;

    if (dueCount === 0 && total > 0) {
        btn.innerHTML = `<span>🎉</span> All Caught Up`;
        btn.disabled = true;
        btn.classList.add('finished');
    } else if (total === 0) {
        btn.disabled = true;
        btn.innerHTML = `Add words to start`;
    } else {
        btn.disabled = false;
        btn.classList.remove('finished');
        if (filterTags.length > 0) {
            const label = filterTags.length === 1 ? filterTags[0] : `${filterTags.length} Tags`;
            btn.innerHTML = `<span>▶</span> Review '${label}'`;
        } else {
            btn.innerHTML = `<span>▶</span> Start Daily Session`;
        }
    }
}

function renderFocusWidget() {
    const container = document.getElementById('active-tags-list');
    if (!container) return;

    const activeTags = store.state.settings.activeFilter || [];

    container.innerHTML = '';
    activeTags.forEach(t => {
        const chip = document.createElement('div');
        chip.className = 'tag-chip';
        // We use a global/exported handler for removal
        chip.innerHTML = `${t} <span data-tag="${t}" class="remove-tag">×</span>`;
        chip.querySelector('.remove-tag').onclick = (e) => removeFocusTag(t);
        container.appendChild(chip);
    });
}

export function handleFocusInput(val) {
    const dropdown = document.getElementById('focus-suggestions');
    if (!dropdown) return;

    if (!val && val !== "") {
        dropdown.classList.add('hidden');
        return;
    }

    const q = val.toLowerCase();

    // Refresh cache if needed (lazy load)
    if (!cachedTags) refreshTagCache();

    const activeTags = store.state.settings.activeFilter || [];

    // Filter suggestions
    const suggestions = cachedTags.filter(t =>
        t.toLowerCase().includes(q) && !activeTags.includes(t)
    ).slice(0, 50);

    if (suggestions.length === 0) {
        dropdown.classList.add('hidden');
        return;
    }

    dropdown.innerHTML = '';
    suggestions.forEach(t => {
        const div = document.createElement('div');
        div.className = 'tag-option';
        div.innerText = t;
        div.onclick = () => addFocusTag(t);
        dropdown.appendChild(div);
    });
    dropdown.classList.remove('hidden');
}

export function addFocusTag(tag) {
    let active = store.state.settings.activeFilter || [];
    if (!active.includes(tag)) {
        active.push(tag);
        active = [...new Set(active)]; // Unique
        store.updateSettings({ activeFilter: active });

        // Clear input
        const input = document.getElementById('focus-input');
        if (input) input.value = '';

        const dropdown = document.getElementById('focus-suggestions');
        if (dropdown) dropdown.classList.add('hidden');

        update(); // Re-render dashboard
    }
}

export function removeFocusTag(tag) {
    let active = store.state.settings.activeFilter || [];
    active = active.filter(t => t !== tag);
    store.updateSettings({ activeFilter: active });
    update();
}

export function refreshTagCache() {
    const tags = new Set();
    store.state.words.forEach(w => {
        if (w.tags) w.tags.forEach(t => tags.add(t));
    });
    cachedTags = Array.from(tags).sort();
}
