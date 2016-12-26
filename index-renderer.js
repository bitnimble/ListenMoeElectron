const
{remote, ipcRenderer} = require('electron'),
Menu = remote.Menu,
socket = new WebSocket("wss://listen.moe/api/v2/socket");

/* Returns menu with items depending on whether a user is logged in */
function buildMenu() {
    let menuTemplate = [];
    if (typeof window.username !== 'undefined') {
        menuTemplate.push({label: `Logged in as ${window.username}`, enabled: false});
        menuTemplate.push({type: 'separator'});
    } else {
        menuTemplate.push({label: "Login", click() {ipcRenderer.send('show-login')}});
    }
    menuTemplate.push({label: "Refresh", click() {socket.send("update")}});
    return Menu.buildFromTemplate(menuTemplate);
}

let menu = buildMenu();

socket.onmessage = (message) => {
    if (message.data.length === 0) return;
    console.log(message);
    let data = JSON.parse(message.data);
    document.getElementById('label-title').innerHTML = data.song_name;
    document.getElementById('label-artist').innerHTML = data.artist_name;
}

remote.getCurrentWindow().addListener('authenticated', (message) => {
    if (typeof message.token === 'undefined' ||
        typeof message.username === 'undefined') return;
    window.token = message.token;
    window.username = message.username;
    menu = buildMenu();
    socket.send(JSON.stringify(message));
});

/* For right-click menu */
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    console.log('contextmenu');
    menu.popup(remote.getCurrentWindow());
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

    document.getElementById('btn-close').addEventListener('click', () => {
        remote.getCurrentWindow().close();
    });

    document.getElementById('right-section').addEventListener("mousewheel", mouseWheelHandler, false);
});
