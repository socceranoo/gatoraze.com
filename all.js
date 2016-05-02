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
var startFunc = require('./start-server')(server, app, port);

var secret_var = require("./secret.json");
console.log("secret is " + secret_var.secret);

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

startFunc();
