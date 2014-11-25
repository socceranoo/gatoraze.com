module.exports = function(app, module_obj, io) {
	var socketServer = require("./socket-server")(io);
	var sleep = require('sleep');
	var playsite = "razePlay";
	var lobbysite = "Lobby";
	//Routes 
	app.get('/', function(req, res){
		if (check_user_name(req)) {
			res.redirect('/lobby');
			return;
		}
		res.render('socketio/views/home', {site:playsite, title:playsite+' - home', name: get_guest_name(5000)});
	});
	app.post('/', function(req, res){
		var user = {name:req.param('user')};
		res.cookie('user', user.name );
		res.redirect('/lobby');
	});
	app.all('*', function(req, res, next){
		if (!check_user_name(req)) {
			res.redirect('/');
			return;
		} else {
			next();
		}
	});
	var process_request = function (req, res, site, players, path) {
		var rand = Math.floor((Math.random()*500)+1);
		var session = req.query.session;
		if (!session) {
			res.redirect('/'+site+'?session='+rand+'&players='+players);
		}
		session = (!session) ? rand : session;
		var room = site+session;
		var temp = socketServer.getRoomInfo(site, room);
		if (temp !== null) {
			players = temp.total;
		}
		var user = req.session.user.name;
		user = "Guest-"+rand;
		res.render('socketio/'+path+'/views/home', {site:site, user:user, room:room, session:session, total:players});
	};
	app.get('/trump', function(req, res){
		var site = "trump";
		var players = req.query.players;
		players = (players && (players == 4 || players == 6 || players == 8)) ? players:4;
		process_request(req, res, site, players, 'game/'+site);
	});
	app.get('/spades', function(req, res){
		var site = "spades";
		var players = 4;
		process_request(req, res, site, players, 'game/trump');
	});
	app.get('/tube', function(req, res){
		var site = "tube";
		var players = 10;
		process_request(req, res, site, players, site);
	});

	app.get('/hearts', function(req, res){
		var site = "hearts";
		var players = 4;
		process_request(req, res, site, players, 'game/'+site);
	});

	app.post('/*lobby', function(req, res){
		res.clearCookie('user');
		req.session.destroy( function(e) {
			res.redirect('/');
		});
	});

	var lobby_request = function (req, res, site) {
		var list = [];
		var user = req.session.user.name;
		socketServer.getActiveRooms(site, list);
		res.render('socketio/views/lobby-'+site, {site:lobbysite, title: lobbysite+' - home', user:user, list:list});
	};

	app.get('/*-lobby', function(req, res) {
		var site = req.params[0];
		if (socketServer.servers[site])
			lobby_request(req, res, site);
		else
			res.redirect('/');
	});

	app.get('/lobby', function(req, res) {
		var user = req.session.user.name;
		res.render('socketio/views/lobby-home', {site:lobbysite, title: lobbysite+' - home', user:user, list:socketServer.servers});
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
