module.exports = function(app, module_obj, io) {
	var AM = module_obj.AM;
	var MM = module_obj.MM;
	var EM = module_obj.EM;
	var socketServer = require("./game/socket-server")(io);
	var count = 0;
	//Routes 
	app.get('/trump', function(req, res){
		var site = "trump";
		count++;
		var user = "socceranoo"+count;
		res.render('socketio/game/views/home', {site:site, title: site+' - home', user:user});
	});
	app.get('/tube', function(req, res){
		var site = "Tube";
		res.render('socketio/tube/views/home', {site:site, title: site+' - home', user:"socceranoo"});
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
