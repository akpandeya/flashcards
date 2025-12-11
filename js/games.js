import * as Storage from './storage.js';

let flippedTiles = [];
let matchedPairs = 0;
let moves = 0;
let isLocked = false;

export function startMemoryGame() {
    const db = Storage.getDB();
    if (db.words.length < 8) {
        alert("You need at least 8 words to play!");
        return;
    }

    // Reset Game State
    flippedTiles = [];
    matchedPairs = 0;
    moves = 0;
    isLocked = false;
    updateMoves();

    // Select 8 random words
    const deck = [...db.words].sort(() => 0.5 - Math.random()).slice(0, 8);

    // Create 16 tiles
    const tiles = [];
    deck.forEach(w => {
        // Pair: Word vs Definition
        tiles.push({ id: w.id, content: w.word, type: 'word' });
        tiles.push({ id: w.id, content: w.def, type: 'def' });
    });

    // Shuffle tiles
    tiles.sort(() => 0.5 - Math.random());

    // Render
    const grid = document.getElementById('memory-grid');
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

    // Show Screen
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('memory-game-screen').classList.remove('hidden');
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
    document.getElementById('mem-moves').innerText = moves;
}

function victory() {
    // Simple Confetti Effect (CSS or JS)
    // For now, let's just use an alert or a nice toast
    // Ideally we inject a confetti canvas but let's keep it simple first

    setTimeout(() => {
        alert(`Victory! 🎉\nCompleted in ${moves} moves.`);
        endMemoryGame();
    }, 500);
}

export function endMemoryGame() {
    document.getElementById('memory-game-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
}
