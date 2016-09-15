var packager = require('electron-packager');
packager({
	'dir': '.',
	'all': true,
	'out': 'bin/',
	'icon': 'icon.ico'
}, function(err, appPaths) {
	
});