/*
    Loads games using network requests,
    creating an iframe,
    and setting its srcdoc attr
    to the response
*/


// returns game frame
export function getIframe() {
    let iframe = document.getElementById('vertex-iframe');
    return iframe
}

// deletes game iframe
export function deleteFrame() {
    getIframe().remove();
}

export function loadGame(url, gameName, nav) {
    // update times a game has been launched
    const launches = JSON.parse(localStorage.getItem("Vertex3.launches") || "{}");
    launches[gameName] = (launches[gameName] || 0) + 1;
    localStorage.setItem("Vertex3.launches", JSON.stringify(launches));

    let iframe = getIframe()

    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'vertex-iframe';
        iframe.tabIndex = 0;
        Object.assign(iframe.style, {
            position: 'fixed',
            top: nav.offsetHeight + 'px',
            left: '0',
            width: '100%',
            height: `calc(100% - ${nav.offsetHeight}px)`,
            border: 'none',
            zIndex: '9999',
            backgroundColor: 'white'
        });
        iframe.setAttributeNS(null, 'allow', 'autoplay; fullscreen *; cross-origin-isolated');
        // Keep keyboard-controlled games focused when they are opened.
        iframe.addEventListener('pointerdown', () => iframe.focus());
        document.body.appendChild(iframe);
    } else {
        iframe.remove();
        document.body.appendChild(iframe);
    }
    iframe.textContent = 'Loading game...';
    iframe.dataset.gameName = gameName;

    // inject css tags and scripts if a game needs it
    function Inject(doc, gameUrl) {
        fetch('src/injects.js')
            .then(res => res.text())
            .then(js => {
                doc.defaultView.eval(js);
                const win = doc.defaultView;
                if (typeof win.JavaScript === 'function') win.JavaScript();
                if (win.JavaScript_overrides && typeof win.JavaScript_overrides[gameUrl] === 'function')
                    win.JavaScript_overrides[gameUrl]();
                if (typeof win.CSSi === 'string') {
                    const style = doc.createElement('style');
                    style.textContent = win.CSSi;
                    doc.head.appendChild(style);
                }
                if (win.CSS_overrides && typeof win.CSS_overrides[gameUrl] === 'string') {
                    const style2 = doc.createElement('style');
                    style2.textContent = win.CSS_overrides[gameUrl];
                    doc.head.appendChild(style2);
                }
            });
    }


    // load flash games using ruffle
    if (url.startsWith("$FLASH/")) {
        let swfPath = url.slice(7); // Remove "$FLASH/"

        // If it's not a remote URL, prepend the local flash folder
        if (!swfPath.startsWith("http")) {
            swfPath = "flash/" + swfPath;
        }

        localStorage.setItem("Vertex3.flashUrl", swfPath);

        fetch("engine/flash/index.html")
            .then(res => res.text())
            .then(html => {
                iframe.srcdoc = html;
                iframe.onload = () => Inject(iframe.contentDocument, swfPath);
            });
    }
    else if (url.startsWith("$SRC")) {
        iframe.src = url.replace("$SRC", "");
        iframe.onload = () => Inject(iframe.contentDocument, url);

        // load roms using Emulator.JS
    } else if (url.startsWith("$GBA/")) {
        const romPath = url.replace("$GBA/", "");
        iframe.setAttribute(
            "allow",
            "autoplay; fullscreen *; geolocation; microphone; camera; midi; monetization; xr-spatial-tracking; gamepad; gyroscope; accelerometer; xr; cross-origin-isolated"
        );

        iframe.setAttribute("data-url", "launcher#" + romPath);

        fetch("engine/emulatorjs/index.html")
            .then(res => res.text())
            .then(html => {
                iframe.srcdoc = html;
                iframe.onload = () => Inject(iframe.contentDocument, url);
            });

        // fetch the game normally
    } else {
        fetch(url)
            .then(res => res.text())
            .then(html => {
                if (url.startsWith('https://')) html = html.replace(/<head>/i, `<head><base href="${url}">`);
                iframe.srcdoc = html;
                iframe.onload = () => {
                    Inject(iframe.contentDocument, url);
                    iframe.focus();
                };
            });
    }
}
