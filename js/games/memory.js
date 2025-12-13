/**
 * Memory Match Game
 * Find pairs of Word vs Definition.
 */
import { store } from '../state.js';

let flippedTiles = [];
let matchedPairs = 0;
let moves = 0;
let isLocked = false;
let onExit = null;

export function startGame(exitCallback) {
    onExit = exitCallback;
    const state = store.state;
    const filterTags = state.settings.activeFilter || [];
    let pool = state.words;

    // Filter Logic
    if (filterTags.length > 0) {
        pool = pool.filter(w => w.tags && filterTags.some(t => w.tags.includes(t)));
    }

    if (pool.length < 8) {
        // We can optionally use showToast if we import it or return error
        const tagLabel = filterTags.length === 1 ? filterTags[0] : `${filterTags.length} tags`;
        alert(filterTags.length > 0 ? `Not enough words with filter '${tagLabel}' (need 8)` : "You need at least 8 words to play!");
        return false;
    }

    // Reset Game State
    flippedTiles = [];
    matchedPairs = 0;
    moves = 0;
    isLocked = false;
    updateMoves();

    // Select 8 random words
    const deck = [...pool].sort(() => 0.5 - Math.random()).slice(0, 8);

    // Create 16 tiles
    const tiles = [];
    deck.forEach(w => {
        tiles.push({ id: w.id, content: w.word, type: 'word' });
        tiles.push({ id: w.id, content: w.translation || w.def, type: 'def' });
    });

    // Shuffle tiles
    tiles.sort(() => 0.5 - Math.random());

    // Render
    const grid = document.getElementById('memory-grid');
    if (!grid) return false;

    grid.innerHTML = '';

    tiles.forEach((tile, index) => {
        const el = document.createElement('div');
        el.className = 'memory-tile';
        el.dataset.index = index;
        el.dataset.id = tile.id;

        const isDef = tile.type === 'def';

        el.innerHTML = `
            <div class="mem-face mem-front">?</div>
            <div class="mem-face mem-back ${isDef ? 'is-def' : ''}">${tile.content}</div>
        `;

        el.onclick = () => handleTileClick(el, tile);
        grid.appendChild(el);
    });

    // Switch View
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('memory-game-screen').classList.remove('hidden');

    return true;
}

function handleTileClick(el, tile) {
    if (isLocked) return;
    if (el.classList.contains('flipped') || el.classList.contains('matched')) return;

    el.classList.add('flipped');
    flippedTiles.push({ el, id: tile.id });

    if (flippedTiles.length === 2) {
        moves++;
        updateMoves();
        checkForMatch();
    }
}

function checkForMatch() {
    isLocked = true;
    const [t1, t2] = flippedTiles;

    if (t1.id === t2.id) {
        // Match!
        setTimeout(() => {
            t1.el.classList.add('matched');
            t2.el.classList.add('matched');
            matchedPairs++;
            flippedTiles = [];
            isLocked = false;

            if (matchedPairs === 8) {
                victory();
            }
        }, 600);
    } else {
        // No match
        setTimeout(() => {
            t1.el.classList.remove('flipped');
            t2.el.classList.remove('flipped');
            flippedTiles = [];
            isLocked = false;
        }, 1000);
    }
}

function updateMoves() {
    const el = document.getElementById('mem-moves');
    if (el) el.innerText = moves;
}

function victory() {
    setTimeout(() => {
        alert(`Victory! 🎉\nCompleted in ${moves} moves.`);
        endGame();
    }, 500);
}

export function endGame() {
    document.getElementById('memory-game-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    // Ideally call onExit callback to let router handle view switching
    // if (onExit) onExit(); // But for now we manipulate DOM directly here to match existing logic
}
