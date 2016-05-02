module.exports = function (server, app, port) {
	var express = require('express');
	app.configure(function(){
		app.set('port', port);
		app.set('views', __dirname + '/app/server');
		app.set('view engine', 'jade');
		app.locals.pretty = true;
		app.use(express.favicon());
		app.use(express.json());
		app.use(express.urlencoded());
		app.use(express.cookieParser());
		app.use(express.session({ secret: 'super-duper-secret-secret' }));
		app.use(express.methodOverride());
		app.use(require('stylus').middleware({ src: __dirname + '/app/public' }));
		app.use(require('less-middleware')({ src : __dirname + '/app/public'}));
		app.use(express.static(__dirname + '/app/public'));
	});

	app.configure('development', function(){
		app.use(express.errorHandler());
	});

	var address = "localhost";
	app.get('*', function(req, res) { res.render('account/views/404', { title: 'Page Not Found'}); });
	console.log("arguments" + process.argv);
	if (process.argv.length > 2) {
		address = process.argv[2];
	}
	var startFunc = function () {
		server.listen(port, address, function(){
			console.log("Express server listening on address " + address + " and port " + app.get('port'));
		});
	};
	/*
	http.createServer(app).listen(app.get('port'), function(){
		console.log("Express server listening on port " + app.get('port'));
	});
	*/
	return startFunc;
};
