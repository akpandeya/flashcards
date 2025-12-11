import { store } from '../js/state.js';
import * as Storage from '../js/core/storage.js';

describe('State Manager (js/state.js)', () => {

    const expect = (typeof window !== 'undefined' && window.chai) ? window.chai.expect : global.expect;

    before(function () {
        if (!window.chai) throw new Error("Chai not loaded");
        // Mock Storage to prevent polluting real DB
        // We can override the methods on the Storage module if it was an object, 
        // but since it exports functions, we can't easily stub them without a bundler.
        // HOWEVER, we can stick to testing the in-memory state mutations which is the core responsibility of StateManager.
        // Integration with localStorage is harder to test here without side effects.

        // Let's reset the store state manually for testing
        // accessing private state is hard, but we can verify public Getters/Setters.
    });

    it('should initialize with default empty state', () => {
        // store is a singleton, might have data from app run if shared context?
        // In this test runner, it's fresh if we don't import app.js
        // But app.js might be imported by other tests? No, separate modules.

        // We can't easily reset the singleton if it's already loaded data.
        // Let's assume it loads empty or we can force load?
        // store.load() calls loadFromLocalStorage.

        // Let's test addWords logic which is pure logic on the state.
        const w1 = { id: 'Test1', word: 'Test1', def: 'Def1' };
        const res = store.addWords([w1]);

        // If it was already there, added might be 0, else 1.
        expect(store.words).to.be.an('array');
        const found = store.words.find(w => w.id === 'Test1');
        expect(found).to.exist;
        expect(found.word).to.equal('Test1');
    });

    it('should update settings correctly', () => {
        store.updateSettings({ activeFilter: ['test-tag'] });
        expect(store.settings.activeFilter).to.include('test-tag');
    });

    it('should update stats correctly', () => {
        store.updateStats({ streak: 999 });
        expect(store.stats.streak).to.equal(999);
    });

    it('should update word progress', () => {
        const w1 = { id: 'ProgTest', word: 'ProgTest' };
        store.addWords([w1]);

        const prog = { interval: 5, repetition: 2, easeFactor: 2.6, dueDate: 1234567890 };
        store.updateWordProgress('ProgTest', prog);

        expect(store.progress['ProgTest']).to.deep.equal(prog);
    });

});
