/**
 * Raindrop Race Module
 * Typing game: Words fall, user types translation/definition.
 */
import { store } from '../state.js';

let rainInterval = null;
let gameLoopId = null;
let activeDrops = [];
let rainScore = 0;
let rainLives = 5;
let spawnRate = 2000;
let dropSpeed = 1.5;

export function startGame() {
    const state = store.state;
    const filterTags = state.settings.activeFilter || [];
    let pool = state.words;

    if (filterTags.length > 0) {
        pool = pool.filter(w => w.tags && filterTags.some(t => w.tags.includes(t)));
    }

    if (pool.length < 5) {
        const tagLabel = filterTags.length === 1 ? filterTags[0] : `${filterTags.length} tags`;
        alert(filterTags.length > 0 ? `Not enough words with filter '${tagLabel}' (need 5)` : "Need at least 5 words to play!");
        return false;
    }

    // Reset
    rainScore = 0;
    rainLives = 5;
    spawnRate = 2000;
    dropSpeed = 1.5;
    activeDrops = [];

    const scoreEl = document.getElementById('rain-score');
    if (scoreEl) scoreEl.innerText = '0';

    const livesEl = document.getElementById('rain-lives');
    if (livesEl) livesEl.innerText = '❤️❤️❤️';

    const area = document.getElementById('rain-area');
    if (area) area.innerHTML = '';

    const input = document.getElementById('rain-input');
    if (input) input.value = '';

    // Show Screen
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('raindrop-game-screen').classList.remove('hidden');

    if (input) {
        input.focus();
        input.onkeydown = (e) => {
            if (e.key === 'Enter') handleRainInput(e.target);
        };
    }

    // Start Loops
    // We bind spawnDrop to this module context
    rainInterval = setInterval(spawnDrop, spawnRate);
    gameLoop();

    return true;
}

function spawnDrop() {
    const state = store.state;
    const filterTags = state.settings.activeFilter || [];
    let pool = state.words;
    if (filterTags.length > 0) {
        pool = pool.filter(w => w.tags && filterTags.some(t => w.tags.includes(t)));
    }

    // Fallback
    if (pool.length === 0) pool = state.words;
    if (pool.length === 0) return; // No words at all

    const word = pool[Math.floor(Math.random() * pool.length)];

    // Create Element
    const el = document.createElement('div');
    el.className = 'raindrop';
    el.innerHTML = `<span>${word.word}</span>`;

    // Use slightly less than 100vw to avoid overflow
    const maxLeft = window.innerWidth - 120;
    el.style.left = Math.random() * maxLeft + 'px';
    el.style.top = '-100px';

    const area = document.getElementById('rain-area');
    if (area) area.appendChild(el);

    activeDrops.push({
        id: word.id,
        word: word.word,
        def: word.def,
        el: el,
        y: -100
    });
}

function gameLoop() {
    gameLoopId = requestAnimationFrame(gameLoop);

    const killZone = window.innerHeight - 100; // Above input area

    activeDrops.forEach((drop, idx) => {
        drop.y += dropSpeed;
        drop.el.style.top = drop.y + 'px';

        if (drop.y > killZone) {
            // Missed!
            activeDrops.splice(idx, 1);
            if (drop.el.parentNode) drop.el.parentNode.removeChild(drop.el);
            loseLife();
        }
    });
}

function handleRainInput(input) {
    const val = input.value.trim().toLowerCase();
    if (!val) return;

    // Check matches
    const matchIndex = activeDrops.findIndex(drop => {
        return drop.def.toLowerCase().includes(val) && val.length > 2;
    });

    if (matchIndex !== -1) {
        // HIT!
        const drop = activeDrops[matchIndex];

        // Visual Pop
        drop.el.style.transform = 'scale(1.5)';
        drop.el.style.opacity = '0';
        setTimeout(() => {
            if (drop.el.parentNode) drop.el.parentNode.removeChild(drop.el);
        }, 200);

        activeDrops.splice(matchIndex, 1);

        rainScore++;
        const scoreEl = document.getElementById('rain-score');
        if (scoreEl) scoreEl.innerText = rainScore;

        input.value = '';

        // Difficulty scaling
        if (rainScore % 5 === 0) {
            dropSpeed += 0.2;
            clearInterval(rainInterval);
            spawnRate = Math.max(800, spawnRate - 200);
            rainInterval = setInterval(spawnDrop, spawnRate);
        }
    } else {
        // Wrong input
        input.style.borderColor = 'red';
        setTimeout(() => input.style.borderColor = 'var(--primary)', 200);
    }
}

function loseLife() {
    rainLives--;
    let hearts = '';
    for (let i = 0; i < rainLives; i++) hearts += '❤️';
    const livesEl = document.getElementById('rain-lives');
    if (livesEl) livesEl.innerText = hearts;

    if (rainLives <= 0) {
        endGame();
        alert(`Game Over! Final Score: ${rainScore}`);
    }
}

export function endGame() {
    clearInterval(rainInterval);
    cancelAnimationFrame(gameLoopId);
    activeDrops = [];
    document.getElementById('raindrop-game-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
}
