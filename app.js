
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
//var io = require('socket.io').listen(server, {log:false});

var CT = require('./app/modules/country-list');
var DBlayer = require('./app/modules/dbaccess-mysql');
var AM = DBlayer.accountManager;
var MM = DBlayer.moneyManager;
var EM = require('./app/modules/email-dispatcher');
var module_obj = {CT:CT, AM:AM, EM:EM, MM:MM, url:''};
var startFunc = require('./start-server')(server, app, port);

//require('./app/server/portfolio/router')(app, module_obj);
require('./app/server/account/router')(app, module_obj);
require('./app/server/money/router')(app, module_obj);

startFunc();
