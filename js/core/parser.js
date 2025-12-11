/**
 * CSV Parser Module
 * Handles parsing pipe-delimited vocabulary data.
 */

/**
 * Parses raw CSV text into Word objects.
 * Format: ID|POS|Gender|German|Plural|Def|...
 * @param {string} text 
 * @returns {Array} Array of word objects
 */
export function parseCSV(text) {
    const lines = text.split('\n');
    let newWords = [];

    lines.forEach(line => {
        if (!line.trim()) return;
        const cols = line.split('|');
        if (cols.length < 1) return;

        const rawWord = cols[0];
        // Clean word (remove #comments or extra spaces)
        const cleanWord = rawWord.split('#')[0].trim();
        if (!cleanWord) return;

        const id = cleanWord;

        newWords.push({
            id: id,
            word: cleanWord,
            pos: cols[1] || 'Word',
            def: cols[5] || 'No definition',
            ex_de: cols[8] || '',
            ex_en: cols[9] || '',
            // Handle tags if present (col 10)
            tags: cols[10] ? cols[10].split(',').map(t => t.trim()) : []
        });
    });

    return newWords;
}
