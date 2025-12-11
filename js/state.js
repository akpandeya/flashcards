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
        activeFilter: [] // Array of tag strings (Deprecating in favor of filter.topics)
    },
    filter: {
        level: null, // 'A1', 'A2', etc.
        topics: []   // ['Food', 'Travel']
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

            // Init filters if missing (new feature)
            if (!this.state.filter) {
                this.state.filter = { level: null, topics: [] };
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
    get filter() { return this.state.filter; }

    get filteredCards() {
        return this.state.words.filter(w => {
            // Level Check
            if (this.state.filter.level) {
                if (!w.tags || !w.tags.includes(this.state.filter.level)) return false;
            }
            // Topic Check (AND Logic)
            if (this.state.filter.topics.length > 0) {
                if (!w.tags) return false;
                // Every selected topic must be present in word tags
                const matchesAll = this.state.filter.topics.every(t => w.tags.includes(t));
                if (!matchesAll) return false;
            }
            return true;
        });
    }

    get availableLevels() {
        const levelRegex = /^(A[12]|B[12]|C[12])$/;
        const levels = new Set();
        this.state.words.forEach(w => {
            if (w.tags) w.tags.forEach(t => {
                if (levelRegex.test(t)) levels.add(t);
            });
        });
        return Array.from(levels).sort();
    }

    get availableTopics() {
        const levelRegex = /^(A[12]|B[12]|C[12])$/;
        const topics = new Set();
        this.state.words.forEach(w => {
            if (w.tags) w.tags.forEach(t => {
                if (!levelRegex.test(t)) topics.add(t);
            });
        });
        return Array.from(topics).sort();
    }

    // --- Filter Actions ---
    setFilterLevel(level) {
        this.state.filter.level = level;
        // We generally don't persist filters permanently? Or should we?
        // User requested UI, but typically session filters are ephemeral. 
        // Let's persist them for now so they survive refresh (nice DX).
        this.save();
    }

    addFilterTopic(topic) {
        if (!this.state.filter.topics.includes(topic)) {
            this.state.filter.topics.push(topic);
            this.save();
        }
    }

    removeFilterTopic(topic) {
        this.state.filter.topics = this.state.filter.topics.filter(t => t !== topic);
        this.save();
    }

    clearFilters() {
        this.state.filter.level = null;
        this.state.filter.topics = [];
        this.save();
    }
}

// Export Singleton
export const store = new StateManager();
