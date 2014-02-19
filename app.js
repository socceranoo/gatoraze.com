
/**
	* Node.js Login Boilerplate
	* More Info : http://bit.ly/LsODY8
	* Copyright (c) 2013 Stephen Braitsch
**/

var express = require('express');
var http = require('http');
var app = express();
var port = 443;

var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {log:false});

var CT = require('./app/modules/country-list');
var DBlayer = require('./app/modules/dbaccess-mysql');
var AM = DBlayer.accountManager;
var MM = DBlayer.moneyManager;
var EM = require('./app/modules/email-dispatcher');
var module_obj = {CT:CT, AM:AM, EM:EM, MM:MM, url:''};

app.configure(function(){
	app.set('port', port);
	app.set('views', __dirname + '/app/server');
	app.set('view engine', 'jade');
	app.locals.pretty = true;
//	app.use(express.favicon());
//	app.use(express.logger('dev'));
//	app.use(express.bodyParser());
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

require('./app/server/portfolio/router')(app, module_obj);
require('./app/server/socketio/router')(app, module_obj, io);
require('./app/server/account/router')(app, module_obj);
require('./app/server/money/router')(app, module_obj);

app.get('*', function(req, res) { res.render('account/views/404', { title: 'Page Not Found'}); });

server.listen(port, function(){
	console.log("Express server listening on port " + app.get('port'));
});
/*
http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
*/
