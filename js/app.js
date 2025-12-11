/**
 * LingoFlow Main Controller
 * Orchestrates the app by wiring modules together.
 */
import { store } from './state.js';
import * as Dashboard from './ui/dashboard.js';
import * as Dictionary from './ui/dictionary.js';
import * as Review from './ui/review.js';
import * as Parser from './core/parser.js';
import * as Memory from './games/memory.js';
import * as Raindrop from './games/raindrop.js';
import * as Crossword from './games/crossword.js';

// --- Global App Object (for HTML events) ---
window.app = {
    // Dashboard / Filter
    handleTopicInput: Dashboard.handleTopicInput,
    setLevel: (lvl) => {
        store.setFilterLevel(lvl);
        Dashboard.update();
    },

    // Review Session
    startSession: () => {
        if (Review.startSession()) {
            // Session started successfully
        }
    },
    // Games
    startMemoryGame: () => Memory.startGame(window.app.goHome),
    endMemoryGame: () => Memory.endGame(), // Fix: Expose Exit
    startRaindropGame: () => Raindrop.startGame(),
    startCrosswordGame: () => Crossword.startGame(),
    endRaindropGame: () => Raindrop.endGame(), // Helper if needed logic calls it
    endCrosswordGame: () => Crossword.endGame(),

    // Board Games Helpers (if inline events use them)
    // Memory uses local click handlers attached in module

    // Dictionary / Detail Modal
    answer: Review.answer,
    speak: Review.speak,

    // Dictionary / Detail Modal
    openDetail: Dictionary.openDetail,
    closeDetail: Dictionary.closeDetail,
    saveDetail: Dictionary.saveDetail,
    addDetailTag: Dictionary.addDetailTag,
    removeDetailTag: Dictionary.removeDetailTag,
    updateDetailExample: Dictionary.updateDetailExample,
    addDetailExample: Dictionary.addDetailExample,
    removeDetailExample: Dictionary.removeDetailExample,

    // Global/Router
    openDictionary: () => {
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('review-screen').classList.add('hidden');
        document.getElementById('dictionary-screen').classList.remove('hidden');
        Dictionary.open();
    },
    goHome: () => {
        document.getElementById('review-screen').classList.add('hidden');
        document.getElementById('dictionary-screen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        Dashboard.update();
    },

    // Data Import
    handleCSV: (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const words = Parser.parseCSV(evt.target.result);
            const res = store.addWords(words);

            showToast(res.added > 0 ? `Added ${res.added} words!` : "No new words found", res.added > 0 ? '📥' : 'Hz');

            // Refresh
            Dashboard.refreshTagCache();
            Dashboard.update();
            e.target.value = '';
        };
        reader.readAsText(file);
    }
};

// --- Initialization ---

// Review Module needs a callback to know when to exit
Review.init(() => {
    window.app.goHome();
    showToast("Session Complete!", '🏆');
});

Dictionary.init();
Dashboard.init();

// Initialize Store and App
(async function initApp() {
    store.load();

    // Auto-fetch default vocabulary if empty
    // OR just fetch to update/merge silently?
    // Let's replicate old behavior: Fetch and merge.
    try {
        const files = ['data/a1_vocabulary.csv', 'data/a2_vocabulary.csv'];
        await Promise.all(files.map(async (file) => {
            const resp = await fetch(file);
            if (resp.ok) {
                const text = await resp.text();
                const words = Parser.parseCSV(text);
                store.addWords(words);
            }
        }));
        Dashboard.refreshTagCache();
    } catch (e) {
        console.warn("Auto-fetch failed", e);
    }

    // Initial Render
    Dashboard.update();

    // Re-bind global listeners if any missed? 
    // Most are handled by imports or window.app delegates.
})();


// --- Helpers ---

function showToast(msg, icon = '✨') {
    const t = document.getElementById('toast');
    if (!t) return;
    const msgEl = document.getElementById('toast-msg');
    if (msgEl) msgEl.innerText = msg;
    const iconEl = document.querySelector('.toast-icon');
    if (iconEl) iconEl.innerText = icon;

    t.classList.add('visible');
    setTimeout(() => t.classList.remove('visible'), 3000);
}
