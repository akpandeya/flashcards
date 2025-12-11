/**
 * State Manager
 * The single source of truth for the application.
 */
import { loadFromLocalStorage, saveToLocalStorage } from './core/storage.js';

// Default State Schema
const defaultState = {
    words: [],      // Array of Word objects
    progress: {},   // { [id]: { interval, repetition, easeFactor, dueDate } }
    stats: {
        streak: 0,
        lastReviewDate: null
    },
    settings: {
        activeFilter: [] // Array of tag strings
    }
};

class StateManager {
    constructor() {
        this.state = JSON.parse(JSON.stringify(defaultState)); // Deep copy
    }

    /**
     * Load state from storage or initialize defaults
     */
    load() {
        const stored = loadFromLocalStorage();
        if (stored) {
            this.state = { ...defaultState, ...stored };

            // Migrations / Safety Checks
            if (!this.state.words) this.state.words = [];
            if (!this.state.progress) this.state.progress = {};
            if (!this.state.stats) this.state.stats = defaultState.stats;
            if (!this.state.settings) this.state.settings = defaultState.settings;

            // Migration: Ensure activeFilter is array
            if (this.state.settings.activeFilter && !Array.isArray(this.state.settings.activeFilter)) {
                this.state.settings.activeFilter = [this.state.settings.activeFilter];
            }
        }
    }

    save() {
        saveToLocalStorage(this.state);
    }

    /**
     * Merge new words into the database.
     * @param {Array} newWords 
     * @returns {Object} { added: number }
     */
    addWords(newWords) {
        let added = 0;
        const existingIds = new Set(this.state.words.map(w => w.id));

        newWords.forEach(w => {
            if (!existingIds.has(w.id)) {
                this.state.words.push(w);
                existingIds.add(w.id);
                added++;
            }
        });

        if (added > 0) this.save();
        return { added };
    }

    /**
     * Update progress for a specific word
     * @param {string} id 
     * @param {Object} progressData 
     */
    updateWordProgress(id, progressData) {
        this.state.progress[id] = progressData;
        this.save();
    }

    updateStats(statsUpdate) {
        this.state.stats = { ...this.state.stats, ...statsUpdate };
        this.save();
    }

    updateSettings(settingsUpdate) {
        this.state.settings = { ...this.state.settings, ...settingsUpdate };
        this.save();
    }

    get words() { return this.state.words; }
    get progress() { return this.state.progress; }
    get settings() { return this.state.settings; }
    get stats() { return this.state.stats; }
}

// Export Singleton
export const store = new StateManager();
