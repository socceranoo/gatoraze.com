module.exports = function(app, module_obj, io) {
	var AM = module_obj.AM;
	var MM = module_obj.MM;
	var EM = module_obj.EM;
	var gameServer = require("./game/game-server")(io);
	var tubeObj = require("./tube/tube-server")(io);
	var eventObj = {};
	eventObj[gameServer.site] = gameServer;
	eventObj[tubeObj.site] = tubeObj;
	var count = 0;

	//Routes 
	app.get('/trump', function(req, res){
		var site = gameServer.site;
		count++;
		var user = "socceranoo"+count;
		res.render('socketio/game/views/home', {site:site, title: site+' - home', user:user});
	});
	app.get('/tube', function(req, res){
		var site = tubeObj.site;
		res.render('socketio/tube/views/home', {site:site, title: site+' - home', user:"socceranoo"});
	});

	//Generic socket connection handler...
	io.sockets.on('connection', function (socket) {
		socket.on('setPseudo', function (data) {
			eventObj[data.userInfo.site].userJoin(socket, data.userInfo);
		});
		socket.on('disconnect', function () {
			if (socket.data)
				eventObj[socket.data.site].userLeave(socket);
		});
	});
};
