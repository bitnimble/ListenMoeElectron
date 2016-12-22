var packager = require('electron-packager');
packager({
	'dir': '.',
	'out': 'bin/',
	'icon': 'icon'
}, function(err, appPaths) {
	
});