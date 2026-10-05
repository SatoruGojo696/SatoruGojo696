// Optional guard for individual games inside locked-games/games/.
// Add <script src="../../guard.js"></script> to a game's index.html.
// The player must have unlocked the Locked Games section first.
(() => {
  const SESSION_KEY = "Vertex3.lockedGamesUnlocked";
  if (sessionStorage.getItem(SESSION_KEY) !== "true") {
    const lockedRoot = new URL("./", document.currentScript.src);
    location.replace(lockedRoot.href);
  }
})();
