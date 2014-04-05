module.exports = function(app, module_obj, io) {
	var AM = module_obj.AM;
	var MM = module_obj.MM;
	var EM = module_obj.EM;
	var socketServer = require("./socket-server")(io);
	var count = 0;
	var sleep = require('sleep');
	//Routes 
	app.get('/trump', function(req, res){
		var rand = Math.floor((Math.random()*500)+1);
		var user = "Guest"+rand;
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
		count++;
		res.render('socketio/game/views/home', {site:site, user:user, room:room, session:session, total:players});
	});
	app.get('/tube', function(req, res){
		var site = "Tube";
		res.render('socketio/tube/views/home', {site:site, user:user, room:room, session:session});
	});

	app.get('/', function(req, res){
		var site = "Lobby";
		var list = {};
		for (var i = 0; i < socketServer.availableServers.length; i++) {
			list[socketServer.availableServers[i]] = [];
		}
		socketServer.getActiveRooms(list);
		res.render('socketio/views/home', {site:site, title: site+' - home', list:list});
	});

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
