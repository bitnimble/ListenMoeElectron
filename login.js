const {remote, BrowserWindow} = require('electron');
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("login-submit").addEventListener('click', (e) => {
        e.preventDefault();
        let
        form_username = document.getElementsByName('username')[0].value,
        form_password = document.getElementsByName('password')[0].value;
        fetch("https://listen.moe/api/authenticate",
            {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({username: form_username, password: form_password})
            })
            .then((res) => { return res.json() })
            .then((res) => {
                console.log(res);
                if (res.success){
                    window.token = res.token;
                    res.username = form_username;
                    remote.BrowserWindow.fromId(1).emit('authenticated', res);
                    remote.getCurrentWindow().hide();
                } else {
                    document.getElementById('error').innerHTML = res.message;
                }
            });
    }, true);
    document.getElementById("login-cancel").addEventListener('click', () => {
        remote.getCurrentWindow().hide();
    });
});
