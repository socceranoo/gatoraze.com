module.exports = function(app, module_obj, io) {
	var AM = module_obj.AM;
	var MM = module_obj.MM;
	var EM = module_obj.EM;
	var socketServer = require("./socket-server")(io);
	var sleep = require('sleep');
	var playsite = "RazeIO";
	var lobbysite = "Lobby";
	//Routes 
	app.get('/trump', function(req, res){
		if (!check_user_name(req)) {
			res.redirect('/');
			return;
		}
		var rand = Math.floor((Math.random()*500)+1);
		var site = "trump";
		var session = req.query.session;
		var players = req.query.players;
		players = (players && (players == 4 || players == 6 || players == 8)) ? players:4;
		session = (!session) ? rand : session;
		var room = site+session;
		var temp = socketServer.getRoomInfo(room);
		if (temp !== null) {
			players = temp.total;
		}
		var user = req.session.user.name;
		user = "Guest-"+rand;
		res.render('socketio/game/trump/views/home', {site:site, user:user, room:room, session:session, total:players});
	});
	app.get('/tube', function(req, res){
		if (!check_user_name(req)) {
			res.redirect('/');
			return;
		}
		var site = "Tube";
		var user = req.session.user.name;
		res.render('socketio/tube/views/home', {site:site, user:user});
	});
	app.get('/hearts', function(req, res){
		if (!check_user_name(req)) {
			res.redirect('/');
			return;
		}
		var rand = Math.floor((Math.random()*500)+1);
		var site = "hearts";
		var session = req.query.session;
		var players = req.query.players;
		session = (!session) ? rand : session;
		var room = site+session;
		players = 4;
		var user = req.session.user.name;
		user = "Guest-"+rand;
		res.render('socketio/game/hearts/views/home', {site:site, user:user, room:room, session:session, total:players});
	});

	app.get('/', function(req, res){
		if (check_user_name(req)) {
			res.redirect('/lobby');
			return;
		}
		res.render('socketio/views/home', {site:playsite, title:playsite+' - home', name: get_guest_name(5000)});
	});
	app.get('/lobby', function(req, res) {
		if (!check_user_name(req)) {
			res.redirect('/');
			return;
		}
		var list = {};
		for (var i = 0; i < socketServer.availableServers.length; i++) {
			list[socketServer.availableServers[i]] = [];
		}
		socketServer.getActiveRooms(list);
		var user = req.session.user.name;
		res.render('socketio/views/lobby', {site:lobbysite, title: lobbysite+' - home', user:user, list:list});
	});
	app.post('/', function(req, res){
		var user = {name:req.param('user')};
		res.cookie('user', user.name, { maxAge: 900000 });
		res.redirect('/lobby');
	});

	app.post('/lobby', function(req, res){
		res.clearCookie('user');
		req.session.destroy( function(e) {
			res.redirect('/');
		});
	});
	var check_user_name = function (req) {
		if (req.cookies.user === undefined){
			return false;
		}
		req.session.user = {name:req.cookies.user};
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
