# Locked Games

This folder is a separate section for games you want to keep behind a 4-digit code.

## Access code

The default code is **####**.

Change it near the top of `locked-games/index.html`:

    const ACCESS_CODE = "####";

This is only a client-side lock. Anyone who can inspect the site source can find the code, so treat it as a fun/private section rather than real security.

## Adding a game

1. Put the game in its own folder inside `locked-games/games/`.

Example:

    locked-games/
      games/
        my-game/
          index.html

2. Add an entry to `locked-games/games.json`:

    [
      {
        "name": "My Game",
        "icon": "../icon/my-game.png",
        "url": "games/my-game/"
      }
    ]

3. Optional: add `<script src="../../guard.js"></script>` inside that game's `index.html` so its direct game URL also checks the unlock session.

The main Locked Games page already checks the code before showing the game list.

## Important

The lock protects the section interface, not the actual files. GitHub Pages is static, so the game files cannot be made truly private with a JavaScript 4-digit password.
