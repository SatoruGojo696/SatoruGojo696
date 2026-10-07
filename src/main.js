/*
    Main code,
    ties everything together
*/


// removes comments from JSONC files before parsing (thanks html for not supporting JSONC out of the gate) (maybe in HTML6🙏)
import * as JSONC from './jsonc.js';

import { renderPage, getGamesPerPage, getSortedGames } from './Page.js';
import { renderPagination } from './Pagination.js';
import { loadGame, deleteFrame, getIframe } from './GameLoader.js';
import { SITE_BACKGROUND } from './site-config.js';

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


// Custom site background is controlled only through src/site-config.js.
function applySiteBackground() {
    const path = String(SITE_BACKGROUND || '').trim().replace(/\\/g, '/').replace(/^\//, '');
    const main = document.querySelector('main');

    if (!main || !path || !path.startsWith('icon/')) return;

    // Apply the image directly to <main> so the relative path is resolved
    // from the site root, not from assets/css/style.css.
    main.style.backgroundColor = 'transparent';
    main.style.backgroundImage = `url("${path.replace(/"/g, '%22')}")`;
    main.style.backgroundPosition = 'center';
    main.style.backgroundSize = 'cover';
    main.style.backgroundRepeat = 'no-repeat';
    main.style.backgroundAttachment = 'fixed';
}

applySiteBackground();
