/*
    displays page content
    and game cards
*/

// returns how many game cards can be rendered on the page
export function getGamesPerPage(gamesContainer, nav, paginationContainer) {
    const containerWidth = gamesContainer.clientWidth;
    const usableHeight = window.innerHeight - nav.offsetHeight - paginationContainer.offsetHeight - 40;
    const cardWidth = 200;
    const cardHeight = 230;

    const columns = Math.max(1, Math.floor(containerWidth / cardWidth));
    const rows = Math.max(1, Math.floor(usableHeight / cardHeight));

    return columns * rows;
}


// returns sorted games based on user's preference
export function getSortedGames(games, currentSort) {
    // times user has launched game
    const launches = JSON.parse(localStorage.getItem("Vertex3.launches") || "{}");

    let sorted = [...games];
    if (currentSort === 'alphabet') {
        // sort using alphanumerical format
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'launches') {
        // sort based on times user has launched
        sorted.sort((a, b) => (launches[b.name] || 0) - (launches[a.name] || 0));
    }
    // else, returns by index (date added)
    return sorted;
}


// creates page elements
export function renderPage(gamesContainer, games, currentSort, searchInput, loadGame, currentPage, perPage) {
    gamesContainer.innerHTML = '';
    const nav = document.querySelector('nav');

    const sortedGames = getSortedGames(games, currentSort);

    function buildSearchRegex(input) {
        let pattern = input
          .replace(/e/g, "[eé]")  // plain e matches e or é
          .replace(/n/g, "[nñ]"); // plain n matches n or ñ
        return new RegExp(pattern, "i"); // case-insensitive
      }
    const regex = buildSearchRegex(searchInput.value);
    const filtered = sortedGames.filter(g => regex.test(g.name));
      
      
    const pageGames = filtered.slice((currentPage - 1) * perPage, (currentPage - 1) * perPage + perPage);

    const cardWidth = 180;
    const cardGap = 20;
    const cardFullWidth = cardWidth + cardGap;
    const columns = Math.max(1, Math.floor(gamesContainer.clientWidth / cardFullWidth));
    const rows = Math.ceil(pageGames.length / columns);

    gamesContainer.style.display = 'flex';
    gamesContainer.style.flexDirection = 'column';
    gamesContainer.style.gap = `${cardGap}px`;
    gamesContainer.style.position = 'relative';

    // draws columns and rows
    for (let r = 0; r < rows; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'game-row';
        rowDiv.style.display = 'flex';
        rowDiv.style.gap = `${cardGap}px`;

        const rowGames = pageGames.slice(r * columns, r * columns + columns);

        const isLastRow = r === rows - 1;
        if (isLastRow && rowGames.length < columns) {
            // last row, not full → dont center align
            rowDiv.style.paddingLeft = `24px`;
            rowDiv.style.justifyContent = 'left';
        } else {
            // full row → center cards
            rowDiv.style.justifyContent = 'center';
            rowDiv.style.paddingLeft = '0';
        }
        
        // draw game cards
        rowGames.forEach((game, idx) => {
            const card = document.createElement('div');
            card.className = 'game-card';
            if (game.new === "true") card.classList.add("new");

            const title = document.createElement('h3');
            title.textContent = game.name;

            let fontSize = "1.7em";
            const maxLength = 28;
            if (game.name.length > maxLength) {
                fontSize = Math.max(10, 16 - (game.name.length - maxLength) * 0.5);
            }
            title.style.fontSize = fontSize + 'px';

            const image = document.createElement('img');
            image.src = game.icon;
            image.alt = game.name;
            card.appendChild(image);
            // new game, add "true" text
            if (game.new === "true") {
                const ribbon = document.createElement("div");
                ribbon.textContent = "NEW";
                ribbon.className = "ribbon";
                card.appendChild(ribbon);
            }
            card.appendChild(title);

            card.style.opacity = 0;
            // add hover effect
            card.style.transform = 'translateY(20px)';
            card.onclick = () => loadGame(game.url, game.name, nav);
            rowDiv.appendChild(card);

            // add pop-in effect
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = 1;
                card.style.transform = 'translateY(0)';
            }, (r * columns + idx) * 50);
        });

        gamesContainer.appendChild(rowDiv);
    }

    gamesContainer.style.height = `${rows * (220 + cardGap)}px`;
}
