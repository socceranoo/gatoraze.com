/**
	* Node.js Login Boilerplate
	* More Info : http://bit.ly/LsODY8
	* Copyright (c) 2013 Stephen Braitsch
**/

var express = require('express');
var http = require('http');
var app = express();
var port = 80;

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

var secret_var = require("./secret.json");
console.log("secret is " + secret_var.secret);

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get('/404', function(req, res) { res.render('account/views/404', { title: 'Page Not Found'}); });

app.get('/passcode', function(req, res){
	res.render('account/views/passcode', { title: 'Enter passcode'});
});

app.post('/passcode', function(req, res){
	var secret = req.param('entry_key');
	if (secret == secret_var.secret) {
		res.cookie('entry_key', secret);
		res.redirect('/portfolio');
	} else {
		res.redirect('/passcode');
	}
});

app.get('/clearpasscode', function(req, res){
	res.clearCookie('entry_key');
	req.session.destroy( function(e) {
		res.redirect('/passcode');
	});
});

app.all('/portfolio', function(req, res, next){
	if (!check_for_entry_key(req)) {
		res.clearCookie('entry_key');
		res.redirect('/passcode');
		return;
	} else {
		next();
	}
});

var check_for_entry_key = function (req) {
	if (req.cookies.entry_key === undefined){
		return false;
	}
	if (req.cookies.entry_key == secret_var.secret) {
		req.session.entry_key = req.cookies.entry_key;
		return true;
	}
	return false;
};

require('./app/server/coolgitstats/router')(app, module_obj);
require('./app/server/socketio/router')(app, module_obj, io);
require('./app/server/portfolio/router')(app, module_obj);
require('./app/server/sports/router')(app, module_obj);
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
