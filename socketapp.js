/**
	* Socket I/O app
	* Copyright (c) 2014 Manjunath
**/

var express = require('express');
var http = require('http');
var app = express();
var port = 9000;

var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {log:false});
var EM = require('./app/modules/email-dispatcher');
var module_obj = {EM:EM};
var startFunc = require('./start-server')(server, app, port);

//require('./app/server/portfolio/router')(app, module_obj);
//require('./app/server/sports/router')(app, module_obj);
require('./app/server/coolgitstats/router')(app, module_obj);
require('./app/server/socketio/router')(app, module_obj, io);

app.get('/', function(req, res){
	res.redirect('/razeplay');
});
startFunc();
