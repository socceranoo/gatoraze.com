module.exports = function(app, module_obj, io) {
	var socketServer = require("./socket-server")(io);
	var sleep = require('sleep');
	var playsite = "razePlay";
	var lobbysite = "Lobby";
	//Routes
	app.get('/razeplay', function(req, res){
		if (check_user_name(req)) {
			res.redirect('/razeplay/lobby');
			return;
		}
		res.render('socketio/views/home', {site:playsite, title:playsite+' - home', name: get_guest_name(5000)});
	});
	app.post('/razeplay', function(req, res){
		var user = {name:req.param('user')};
		res.cookie('razeplay_user', user.name );
		res.redirect('/razeplay/lobby');
	});
	app.all('/razeplay/*', function(req, res, next){
		if (!check_user_name(req)) {
			res.redirect('/razeplay');
			return;
		} else {
			next();
		}
	});
	var process_request = function (req, res, site, players, path) {
		var rand = Math.floor((Math.random()*500)+1);
		var session = req.query.session;
		if (!session) {
			res.redirect('/razeplay/'+site+'?session='+rand+'&players='+players);
		}
		session = (!session) ? rand : session;
		var room = site+session;
		var temp = socketServer.getRoomInfo(site, room);
		if (temp !== null) {
			players = temp.total;
		} else {
			socketServer.initializeSocketRoom(site, session, room, players);
		}
		var view_only = req.query.view;
		view_only = (view_only) ? true : false;
		var user = req.session.razeplay_user.name;
		user = "Guest-"+rand;
		var info = {site:site, user:user, room:room, session:session, total:players, view:view_only};
		res.render('socketio/'+path+'/views/home', info);
	};
	app.get('/razeplay/trump', function(req, res){
		var site = "trump";
		var players = req.query.players;
		players = (players && (players == 4 || players == 6 || players == 8)) ? players:4;
		process_request(req, res, site, players, 'game');
	});
	app.get('/razeplay/spades', function(req, res){
		var site = "spades";
		var players = 4;
		process_request(req, res, site, players, 'game');
	});
	app.get('/razeplay/tube', function(req, res){
		var site = "tube";
		var players = 10;
		process_request(req, res, site, players, site);
	});

	app.get('/razeplay/hearts', function(req, res){
		var site = "hearts";
		var players = 4;
		process_request(req, res, site, players, 'game');
	});

	app.get('/razeplay/ass', function(req, res){
		var site = "ass";
		var players = 4;
		process_request(req, res, site, players, 'game');
	});

	app.post('/razeplay/*lobby', function(req, res){
		res.clearCookie('razeplay_user');
		req.session.destroy( function(e) {
			res.redirect('/razeplay');
		});
	});

	var lobby_request = function (req, res, site, obj) {
		var list = [];
		var user = req.session.razeplay_user.name;
		socketServer.getActiveRooms(site, list);
		res.render('socketio/views/lobby-site', {site:site, title: site+' - lobby', user:user, obj:obj, list:list});
	};

	app.get('/razeplay/*-lobby', function(req, res) {
		var site = req.params[0];
		if (socketServer.servers[site])
			lobby_request(req, res, site, socketServer.servers[site]);
		else
			res.redirect('/');
	});

	app.get('/razeplay/lobby', function(req, res) {
		var user = req.session.razeplay_user.name;
		res.render('socketio/views/lobby-home', {site:lobbysite, title: lobbysite+' - home', user:user, list:socketServer.servers});
	});

	var check_user_name = function (req) {
		if (req.cookies.razeplay_user === undefined){
			return false;
		}
		req.session.razeplay_user = {name:req.cookies.razeplay_user};
		return true;
	};
	var get_guest_name = function (limit) {
		var rand = Math.floor((Math.random()*limit)+1);
		return "Guest-"+rand;
	};
	//Generic socket connection handler...
	io.sockets.on('connection', function (socket) {
		socket.on('setPseudo', function (data) {
			socketServer.userJoin(socket, data.userInfo);
		});
		socket.on('disconnect', function () {
			if (socket.data)
				socketServer.userLeave(socket, socket.data.userInfo);
		});
	});
};
