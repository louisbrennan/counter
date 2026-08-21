'use strict';

// ── Constants ────────────────────────────────────────────────
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const STORAGE_KEY = 'counter-app-state';

// ── State ────────────────────────────────────────────────────
/** @type {Record<string, number>} */
let state = loadState();

// ── DOM references ───────────────────────────────────────────
const clickSound = /** @type {HTMLAudioElement} */ (document.getElementById('click-sound'));
const totalEl    = document.getElementById('total-value');

/** @type {Record<string, HTMLElement>} */
const valueEls = {};

// ── Initialization ───────────────────────────────────────────
DAYS.forEach(day => {
  const row      = document.querySelector(`.counter-row[data-day="${day}"]`);
  const valEl    = row.querySelector('.counter-value');
  const incBtn   = row.querySelector('.btn-inc');
  const decBtn   = row.querySelector('.btn-dec');
  const resetBtn = row.querySelector('.btn-reset-day');

  valueEls[day] = valEl;

  incBtn.addEventListener('click', () => {
    state[day] += 1;
    persist();
    render();
    playClick();
  });

  decBtn.addEventListener('click', () => {
    state[day] -= 1;
    persist();
    render();
    playClick();
  });

  resetBtn.addEventListener('click', () => {
    state[day] = 0;
    persist();
    render();
  });
});

// Initial render
render();

// ── Functions ────────────────────────────────────────────────

/** Render all day values and the derived total into the DOM. */
function render() {
  let total = 0;
  DAYS.forEach(day => {
    const val = state[day];
    valueEls[day].textContent = val;
    total += val;
  });
  totalEl.textContent = total;
}

/** Persist current state to localStorage. */
function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Load state from localStorage, falling back to all-zero defaults.
 * @returns {Record<string, number>}
 */
function loadState() {
  const defaults = Object.fromEntries(DAYS.map(d => [d, 0]));
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw);
    // Merge — any missing key falls back to 0
    DAYS.forEach(d => {
      if (typeof saved[d] !== 'number') saved[d] = 0;
    });
    return saved;
  } catch {
    return defaults;
  }
}

/**
 * Play the click sound.
 * Resets currentTime so rapid clicks replay from the start.
 */
function playClick() {
  try {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {
      // Autoplay may be blocked before user interaction — silently ignore.
    });
  } catch {
    // Ignore any synchronous errors (e.g. missing src).
  }
}
