const
{remote, ipcRenderer} = require('electron'),
Menu = remote.Menu,
currentWindow = remote.getCurrentWindow();
let
ls = window.localStorage, // for brevity
socket;

if ((Date.now() - ls.timestamp) > 2592000000) {
    ls.clear();
}

/* Returns menu with items depending on whether a user is logged in */
function buildMenu() {
    let menuTemplate = [];
    if (typeof ls.username !== 'undefined') {
        menuTemplate.push(
            {label: `Logged in as ${ls.username}`, enabled: false}
        );
    } else {
        menuTemplate.push(
            {label: "Login", click() {ipcRenderer.send('show-login');}}
        );
    }
    menuTemplate.push({type: 'separator'});
    menuTemplate.push({label: "Refresh", click() {socket.send("update");}});
    menuTemplate.push({
        label: "Always on top",
        type: 'checkbox',
        click() {currentWindow.setAlwaysOnTop(!currentWindow.isAlwaysOnTop());}
    });
    return Menu.buildFromTemplate(menuTemplate);
}

let menu = buildMenu();

function initWebSocket() {
    socket = new WebSocket("wss://listen.moe/api/v2/socket");
    socket.onmessage = function(message) {
        let data = JSON.parse(message.data);
        console.log(message);
        if (message.data.length === 0) { return; }
        window.songInfo = data;

        document.getElementById('label-title').innerHTML = data.song_name;
        let artistAnimeName = data.artist_name;
        if (data.anime_name) {
            if (data.artist_name) {
                artistAnimeName += ` (${data.anime_name})`;
            } else {
                artistAnimeName = data.anime_name;
            }
        }
        //What is readability
        let middle = data.requested_by ? ((artistAnimeName.trim()) ? "; Requested by " : "Requested by ") : "";

        document.getElementById('label-artist').innerHTML = `${artistAnimeName.trim()}${middle}${data.requested_by}`;

        let favoriteButton = document.getElementById('btn-favorite');
        if (typeof data.extended !== 'undefined') {
            favoriteButton.classList.toggle('in-favorites', data.extended.favorite);
        } else {
            favoriteButton.classList.toggle('in-favorites', false);
        }
    };

    socket.onclose = function() {
        //Reconnect after 2 seconds if we dc
        setTimeout(function() { initWebSocket(); }, 2000);
    };
}
initWebSocket();

currentWindow.addListener('authenticated', (message) => {
    if (typeof message.token === 'undefined' ||
        typeof message.username === 'undefined') { return; }
    ls.token = message.token;
    ls.timestamp = + new Date();
    ls.username = message.username;
    menu = buildMenu();
    socket.send(JSON.stringify(message));
});

/* For right-click menu */
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    menu.popup(currentWindow);
}, false);

function mouseWheelHandler (e) {
    let
    mediaPlayer = document.getElementById("audio-player"),
    amount = mediaPlayer.volume + (e.wheelDelta / 2400);

    amount = Math.max(0, amount);
    amount = Math.min(1, amount);
    mediaPlayer.volume = amount;

    let rounded = Math.round(amount * 100);
    document.getElementById("label-volume").innerHTML = rounded + '%';
}

document.addEventListener('DOMContentLoaded', () => {
    let body = document.getElementsByTagName('body')[0];
    if (typeof ls.token !== 'undefined' && !body.classList.contains('logged-in')) {
        body.classList.add('logged-in');
    }

    document.getElementById('btn-pause-play').addEventListener('click', () => {
        let
        btn = document.getElementById('btn-pause-play'),
        mediaPlayer = document.getElementById("audio-player");

        if (btn.classList.contains("btn-pause")) {
            //Pause it
            mediaPlayer.pause();

            btn.classList.remove("btn-pause");
            btn.classList.add("btn-play");
        } else {
            //Play it
            mediaPlayer.load();
            mediaPlayer.play();

            btn.classList.remove("btn-play");
            btn.classList.add("btn-pause");
        }
    });

    document.getElementById('btn-favorite').addEventListener('click', () => {
        if (typeof ls.token === 'undefined') { return; }
        let message = {song: window.songInfo.song_id, token: ls.token};
        fetch('https://listen.moe/api/songs/favorite',
        {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(message)
        })
        .then((res) => { return res.json(); })
        .then((res) => {
            document.getElementById('btn-favorite').classList.toggle('in-favorites', res.favorite);
        });
    });

    document.getElementById('btn-close').addEventListener('click', () => {
        currentWindow.close();
    });

    document.querySelector('.right-section')
    .addEventListener("mousewheel", mouseWheelHandler, false);
});
