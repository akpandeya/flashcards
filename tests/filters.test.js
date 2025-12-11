import { expect } from 'chai';
import { store } from '../js/state.js';

describe('Smart Filters (js/state.js)', () => {

    beforeEach(() => {
        // Reset State
        store.state.words = [
            { id: '1', german: 'Apfel', tags: ['A1', 'Food'] },
            { id: '2', german: 'Auto', tags: ['A1', 'Travel'] },
            { id: '3', german: 'Banane', tags: ['A2', 'Food'] },
            { id: '4', german: 'Zug', tags: ['B1', 'Travel'] },
            { id: '5', german: 'Computer', tags: ['B2', 'Tech'] },
            { id: '6', german: 'Pizza', tags: ['A1', 'Food', 'Travel'] } // Multi-topic
        ];
        store.clearFilters();
    });

    it('should return all cards when no filter is active', () => {
        expect(store.filteredCards.length).to.equal(6);
    });

    it('should filter by Level correctly', () => {
        store.setFilterLevel('A1');
        const result = store.filteredCards;
        expect(result.length).to.equal(3); // Apfel, Auto, Pizza
        expect(result.some(w => w.german === 'Apfel')).to.be.true;
        expect(result.some(w => w.german === 'Banane')).to.be.false;
    });

    it('should filter by Topic correctly', () => {
        store.addFilterTopic('Food');
        const result = store.filteredCards;
        expect(result.length).to.equal(3); // Apfel, Banane, Pizza
        expect(result.some(w => w.german === 'Apfel')).to.be.true;
    });

    it('should combine Level AND Topic (AND logic)', () => {
        store.setFilterLevel('A1');
        store.addFilterTopic('Food');

        const result = store.filteredCards;
        // Should be A1 AND Food
        // Apfel (A1, Food) -> Yes
        // Auto (A1, Travel) -> No
        // Banane (A2, Food) -> No
        // Pizza (A1, Food, Travel) -> Yes

        expect(result.length).to.equal(2);
        expect(result.map(w => w.german)).to.include('Apfel');
        expect(result.map(w => w.german)).to.include('Pizza');
    });

    it('should handle multiple topics (AND logic)', () => {
        store.addFilterTopic('Food');
        store.addFilterTopic('Travel');

        const result = store.filteredCards;
        // Must have BOTH Food and Travel
        // Pizza only
        expect(result.length).to.equal(1);
        expect(result[0].german).to.equal('Pizza');
    });

    it('should extract available levels and topics correctly', () => {
        const levels = store.availableLevels;
        const topics = store.availableTopics;

        expect(levels).to.deep.equal(['A1', 'A2', 'B1', 'B2']); // Sort order?
        expect(topics).to.include('Food');
        expect(topics).to.include('Travel');
        expect(topics).to.include('Tech');
        expect(topics).to.not.include('A1');
    });
});
