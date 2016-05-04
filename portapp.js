/**
	* Socket I/O app
	* Copyright (c) 2014 Manjunath
**/

var express = require('express');
var http = require('http');
var app = express();
var port = 9002;
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {log:false});
var EM = require('./app/modules/email-dispatcher');
var module_obj = {EM:EM};
var startFunc = require('./start-server')(server, app, port);

var secret_var = require("./secret.json");
console.log("secret is " + secret_var.secret);
require('./app/server/portfolio/router')(app, module_obj, secret_var);

startFunc();
