const
{app, BrowserWindow, ipcMain} = require('electron');

let window, loginWindow;

function createWindow() {
    window = new BrowserWindow({
    	width: 400,
    	height: 48,
    	frame: false,
    	resizable: false,
    	maximizable: false,
    	fullscreenable: false,
    	title: "Listen.moe"
    });
	window.loadURL(`file://${__dirname}/index.html`);
	window.on('closed', () => {
        loginWindow.close();
		window = null;
	});
}

function createLoginWindow() {
	loginWindow = new BrowserWindow({
		width: 400,
		height: 200,
		frame: false,
		resizable: false,
		maximizable: false,
		fullscreenable: false,
		title: "Listen.moe login",
		show: false
	});
	loginWindow.loadURL(`file://${__dirname}/login.html`);
	loginWindow.on('closed', () => {
		loginWindow = null;
	});
}

app.on('ready', () => {
	createWindow();
	createLoginWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
	    app.quit();
    }
});

app.on('activate', () => {
    if (window === null) {
        createWindow();
    }
});

ipcMain.on('show-login', () => loginWindow.show());
