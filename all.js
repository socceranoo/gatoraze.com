/**
	* Copyright (c) 2015 Anoop Manjunath Mageswaran
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

require('./app/server/coolgitstats/router')(app, module_obj);
require('./app/server/socketio/router')(app, module_obj, io);
require('./app/server/portfolio/router')(app, module_obj, secret_var);
require('./app/server/sports/router')(app, module_obj);
require('./app/server/account/router')(app, module_obj);
require('./app/server/money/router')(app, module_obj);

startFunc();
