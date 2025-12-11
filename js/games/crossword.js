/**
 * Crossword Game Module
 * Generates and plays a crossword from vocabulary.
 */
import { store } from '../state.js';

let cwGridSize = 15;
let cwGrid = []; // 2D array [row][col] = { char, clueId }
let cwWords = []; // { id, word, clue, row, col, dir(0=ac,1=dn), num }

export function startGame() {
    const state = store.state;
    const filterTags = state.settings.activeFilter || [];
    let pool = state.words;

    if (filterTags.length > 0) {
        pool = pool.filter(w => w.tags && filterTags.some(t => w.tags.includes(t)));
    }

    if (pool.length < 10) {
        const tagLabel = filterTags.length === 1 ? filterTags[0] : `${filterTags.length} tags`;
        alert(filterTags.length > 0 ? `Not enough words with filter '${tagLabel}' (need 10)` : "Need at least 10 words to generate crossword!");
        return false;
    }

    // Select words (try more to fit)
    const selection = [...pool].sort(() => 0.5 - Math.random()).slice(0, 15);

    // Generate
    const success = generateCrossword(selection);
    if (!success) {
        alert("Could not generate a valid grid. Try adding more words!");
        return false;
    }

    renderCrossword();

    // Show Screen
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('crossword-game-screen').classList.remove('hidden');

    return true;
}

function generateCrossword(pool) {
    // Reset
    cwGrid = Array(cwGridSize).fill(null).map(() => Array(cwGridSize).fill(null));
    cwWords = [];

    // Sort pool by length desc
    pool.sort((a, b) => b.word.length - a.word.length);

    // Place first word in center horizontal
    const first = pool[0];
    const fRow = Math.floor(cwGridSize / 2);
    const fCol = Math.floor((cwGridSize - first.word.length) / 2);

    if (!placeWord(first, fRow, fCol, 0)) return false;
    cwWords.push({ ...first, row: fRow, col: fCol, dir: 0 });

    const remaining = pool.slice(1);

    // Try to place remaining
    for (const w of remaining) {
        if (cwWords.length >= 10) break; // Enough words

        let placed = false;
        // Shuffle existing words to try random intersections first
        const targets = [...cwWords].sort(() => 0.5 - Math.random());

        for (const target of targets) {
            if (placed) break;

            // Find common letters
            for (let i = 0; i < w.word.length; i++) {
                if (placed) break;
                const char = w.word[i].toLowerCase();

                // Iterate target word chars
                const tWord = target.word;
                for (let j = 0; j < tWord.length; j++) {
                    if (tWord[j].toLowerCase() === char) {
                        // Intersection candidate
                        const newDir = target.dir === 0 ? 1 : 0;
                        const iRow = target.row + (target.dir === 1 ? j : 0);
                        const iCol = target.col + (target.dir === 0 ? j : 0);
                        const sRow = iRow - (newDir === 1 ? i : 0);
                        const sCol = iCol - (newDir === 0 ? i : 0);

                        if (canPlace(w.word, sRow, sCol, newDir)) {
                            placeWord(w, sRow, sCol, newDir);
                            cwWords.push({ ...w, row: sRow, col: sCol, dir: newDir });
                            placed = true;
                        }
                    }
                }
            }
        }
    }

    // Renumber words logic
    cwWords.sort((a, b) => (a.row - b.row) || (a.col - b.col));
    cwWords.forEach((w, idx) => w.num = idx + 1);

    return cwWords.length >= 5; // Success if at least 5 words placed
}

function canPlace(word, row, col, dir) {
    if (row < 0 || col < 0) return false;
    if (dir === 0 && col + word.length > cwGridSize) return false;
    if (dir === 1 && row + word.length > cwGridSize) return false;

    for (let i = 0; i < word.length; i++) {
        const r = row + (dir === 1 ? i : 0);
        const c = col + (dir === 0 ? i : 0);
        const cell = cwGrid[r][c];

        // Check 1: Conflict
        if (cell && cell.char !== word[i].toLowerCase()) return false;

        // Check 2: Adjacent collision
        if (!cell) {
            if (hasNeighbors(r, c, dir)) return false;
            // Check boundaries
            if (i === 0) {
                const pr = r - (dir === 1 ? 1 : 0);
                const pc = c - (dir === 0 ? 1 : 0);
                if (isValid(pr, pc) && cwGrid[pr][pc]) return false;
            }
            if (i === word.length - 1) {
                const nr = r + (dir === 1 ? 1 : 0);
                const nc = c + (dir === 0 ? 1 : 0);
                if (isValid(nr, nc) && cwGrid[nr][nc]) return false;
            }
        }
    }
    return true;
}

function hasNeighbors(row, col, ignoreDir) {
    if (ignoreDir === 0) {
        if (isValid(row - 1, col) && cwGrid[row - 1][col]) return true;
        if (isValid(row + 1, col) && cwGrid[row + 1][col]) return true;
    } else {
        if (isValid(row, col - 1) && cwGrid[row][col - 1]) return true;
        if (isValid(row, col + 1) && cwGrid[row][col + 1]) return true;
    }
    return false;
}

function isValid(r, c) {
    return r >= 0 && r < cwGridSize && c >= 0 && c < cwGridSize;
}

function placeWord(w, row, col, dir) {
    for (let i = 0; i < w.word.length; i++) {
        const r = row + (dir === 1 ? i : 0);
        const c = col + (dir === 0 ? i : 0);
        cwGrid[r][c] = { char: w.word[i].toLowerCase() };
    }
    return true;
}

function renderCrossword() {
    const gridEl = document.getElementById('cw-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    // Fill Grid
    for (let r = 0; r < cwGridSize; r++) {
        for (let c = 0; c < cwGridSize; c++) {
            const cellData = cwGrid[r][c];
            const div = document.createElement('div');

            if (cellData) {
                div.className = 'cw-cell';

                // Check if this is a word start
                const startWord = cwWords.find(w => w.row === r && w.col === c);
                if (startWord) {
                    div.innerHTML += `<span class="cw-num">${startWord.num}</span>`;
                }

                // Add input (using global handler ref for now, or assume event delegation?)
                // Since this is a module, we can attach event listeners directly.
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'cw-input';
                input.maxLength = 1;
                input.dataset.r = r;
                input.dataset.c = c;
                input.onkeyup = (e) => handleCwInput(e, r, c);
                div.appendChild(input);

            } else {
                div.className = 'cw-cell black';
            }
            gridEl.appendChild(div);
        }
    }

    // Render Clues
    const acrossEl = document.getElementById('clues-across');
    const downEl = document.getElementById('clues-down');
    if (acrossEl) acrossEl.innerHTML = '';
    if (downEl) downEl.innerHTML = '';

    cwWords.forEach(w => {
        const el = document.createElement('div');
        el.className = 'clue-item';
        el.innerHTML = `<strong>${w.num}</strong>. ${w.def}`;
        el.id = `clue-${w.id}`;
        el.onclick = () => focusWord(w);

        if (w.dir === 0 && acrossEl) acrossEl.appendChild(el);
        else if (downEl) downEl.appendChild(el);
    });
}

function handleCwInput(e, r, c) {
    const val = e.target.value;

    const cell = cwGrid[r][c];
    if (val.toLowerCase() === cell.char) {
        e.target.parentElement.classList.add('correct');
        e.target.parentElement.style.background = '#86efac';
        checkWinCondition();
    } else if (val) {
        e.target.parentElement.classList.remove('correct');
        e.target.parentElement.style.background = 'white';
    }

    // Navigation logic (simple)
    // If typing logic needed, we can implement moveFocus here
}

function focusWord(w) {
    const inp = document.querySelector(`.cw-input[data-r="${w.row}"][data-c="${w.col}"]`);
    if (inp) inp.focus();
}

function checkWinCondition() {
    const inputs = document.querySelectorAll('.cw-input');
    const allCorrect = Array.from(inputs).every(inp => {
        const r = parseInt(inp.dataset.r);
        const c = parseInt(inp.dataset.c);
        return inp.value.toLowerCase() === cwGrid[r][c].char;
    });

    if (allCorrect) {
        setTimeout(() => {
            alert("Crossword Solved! 🎉");
            endGame();
        }, 500);
    }
}

export function endGame() {
    document.getElementById('crossword-game-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
}
