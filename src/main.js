/*
    Main code,
    ties everything together
*/


// removes comments from JSONC files before parsing (thanks html for not supporting JSONC out of the gate) (maybe in HTML6🙏)
import * as JSONC from './jsonc.js';

import { renderPage, getGamesPerPage, getSortedGames } from './Page.js';
import { renderPagination } from './Pagination.js';
import { loadGame, deleteFrame, getIframe } from './GameLoader.js';

let games = [];
let currentPage = 1;
let currentSort = localStorage.getItem("Vertex3.sort");
const gamesContainer = document.getElementById('games');
const paginationContainer = document.getElementById('pagination');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const newGamesButton = document.getElementById('newGamesButton');
const favoritesButton = document.getElementById('favoritesButton');
let showNewOnly = false;
let showFavoritesOnly = false;

const nav = document.querySelector('nav');
[...nav.children].forEach(elem =>
    elem.addEventListener('click', () => deleteFrame())
);

if (!currentSort) sortSelect.value = "";
else sortSelect.value = currentSort;

function update(page = 1) {
    currentPage = page;
    const perPage = getGamesPerPage(gamesContainer, nav, paginationContainer);
    const visibleGames = games.filter(game => {
        if (showNewOnly && game.new !== "true") return false;
        if (showFavoritesOnly && !getFavorites().has(game.name)) return false;
        return true;
    });
    renderPage(gamesContainer, visibleGames, currentSort, searchInput, loadGame, currentPage, perPage);
    renderPagination(paginationContainer, visibleGames, currentSort, searchInput, currentPage, perPage, update);
}

function getFavorites() {
    try {
        return new Set(JSON.parse(localStorage.getItem("Vertex3.favorites") || "[]"));
    } catch {
        return new Set();
    }
}

function refresh() { update(1); }

searchInput.addEventListener('input', refresh);
window.addEventListener('resize', refresh);
favoritesButton.addEventListener('click', () => {
    showFavoritesOnly = !showFavoritesOnly;
    favoritesButton.classList.toggle('active', showFavoritesOnly);
    favoritesButton.setAttribute('aria-pressed', String(showFavoritesOnly));
    refresh();
});

newGamesButton.addEventListener('click', () => {
    showNewOnly = !showNewOnly;
    newGamesButton.classList.toggle('active', showNewOnly);
    newGamesButton.setAttribute('aria-pressed', String(showNewOnly));
    refresh();
});

sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    localStorage.setItem("Vertex3.sort", currentSort);
    refresh();
});


// toggle fullscreen
function ToggleFullscreen() {
    const iframe = getIframe();
    const element = iframe || document.body;

    if (document.fullscreenElement === element) {
        document.exitFullscreen();
    } else {
        element.requestFullscreen();
        if (iframe) iframe.focus();
    }
}
nav.addEventListener("click", element => {
    if (element.target === nav) {
        ToggleFullscreen();
    }
});

// Load games from JSONC
fetch('content.jsonc?' + Date.now())
    .then(res => res.text())
    .then(text => {
        const cleanText = JSONC.clean(text);
        let data;
        try {
            data = JSON.parse(cleanText);
        } catch (err) {
            console.error('Failed to parse JSONC:', err);
            return;
        }
        games = data.games;
        refresh();
    })
    .catch(err => console.error('Failed to load JSONC:', err));

// Expose global loader
window.Vertex3 = window.Vertex3 || {};
window.Vertex3.LoadGame = (url, gameName, nav) => loadGame(url, gameName, nav);


// Custom site background
const backgroundButton = document.getElementById('backgroundButton');
const backgroundOverlay = document.getElementById('backgroundOverlay');
const backgroundInput = document.getElementById('backgroundInput');
const backgroundApply = document.getElementById('backgroundApply');
const backgroundClear = document.getElementById('backgroundClear');
const backgroundClose = document.getElementById('backgroundClose');
const backgroundStatus = document.getElementById('backgroundStatus');
const BACKGROUND_KEY = 'Vertex3.backgroundImage';

function setSiteBackground(path) {
    const cleanPath = path.trim();
    if (!cleanPath) {
        document.body.style.removeProperty('--vertex-background-image');
        localStorage.removeItem(BACKGROUND_KEY);
        backgroundStatus.textContent = 'Background cleared.';
        return;
    }
    const safePath = cleanPath.replace(/\\/g, '/').replace(/^\//, '');
    if (!safePath.startsWith('icon/')) {
        backgroundStatus.textContent = 'Please use an image path starting with icon/. ';
        return;
    }
    document.body.style.setProperty('--vertex-background-image', `url("${safePath.replace(/"/g, '%22')}")`);
    localStorage.setItem(BACKGROUND_KEY, safePath);
    backgroundStatus.textContent = 'Background saved!';
}

if (backgroundButton && backgroundOverlay) {
    const savedBackground = localStorage.getItem(BACKGROUND_KEY);
    if (savedBackground) {
        backgroundInput.value = savedBackground;
        setSiteBackground(savedBackground);
        backgroundStatus.textContent = '';
    }
    backgroundButton.addEventListener('click', () => {
        backgroundOverlay.hidden = false;
        backgroundInput.focus();
    });
    backgroundApply.addEventListener('click', () => setSiteBackground(backgroundInput.value));
    backgroundClear.addEventListener('click', () => {
        backgroundInput.value = '';
        setSiteBackground('');
    });
    backgroundClose.addEventListener('click', () => { backgroundOverlay.hidden = true; });
    backgroundOverlay.addEventListener('click', event => {
        if (event.target === backgroundOverlay) backgroundOverlay.hidden = true;
    });
    backgroundInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') setSiteBackground(backgroundInput.value);
        if (event.key === 'Escape') backgroundOverlay.hidden = true;
    });
}
