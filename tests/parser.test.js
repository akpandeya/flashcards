import { parseCSV } from '../js/core/parser.js';

describe('CSV Parser (js/core/parser.js)', () => {

    const expect = window.chai ? window.chai.expect : null;

    before(function () {
        if (!window.chai) throw new Error("Chai not loaded");
    });

    it('should parse valid CSV lines correctly', () => {
        const input = `Haus|Noun|n|||House|||Example DE|Example EN|Tag1, Tag2`;
        const result = parseCSV(input);
        expect(result).to.have.lengthOf(1);
        const w = result[0];
        expect(w.id).to.equal('Haus');
        expect(w.word).to.equal('Haus');
        expect(w.pos).to.equal('Noun');
        expect(w.def).to.equal('House');
        expect(w.ex_de).to.equal('Example DE');
        expect(w.ex_en).to.equal('Example EN');
        expect(w.tags).to.include('Tag1');
        expect(w.tags).to.include('Tag2');
    });

    it('should handle empty lines and comments', () => {
        const input = `
        # This is a comment
        
        Apfel|Noun||||Apple
        # Another comment
        `;
        const result = parseCSV(input);
        expect(result).to.have.lengthOf(1);
        expect(result[0].word).to.equal('Apfel');
    });

    it('should remove inline comments from the first column', () => {
        const input = `Ball # inline comment|Noun||||Ball`;
        const result = parseCSV(input);
        expect(result[0].word).to.equal('Ball');
        expect(result[0].id).to.equal('Ball');
    });

    it('should handle minimal columns', () => {
        const input = `Hund`; // Just ID/Word
        const result = parseCSV(input);
        expect(result[0].word).to.equal('Hund');
        expect(result[0].def).to.equal('No definition');
        expect(result[0].pos).to.equal('Word');
        expect(result[0].tags).to.be.an('array').that.is.empty;
    });

});
