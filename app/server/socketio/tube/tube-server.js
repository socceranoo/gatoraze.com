module.exports = function(IO) {
	var obj = {};
	var ioObj = IO;
	obj.site = "Tube";

	obj.eventInit = function (socket) {
		socket.on('event1', function () {
			console.log("event1");
			ioObj.sockets.in(socket.data.room).emit('message', "event1");
		});
		socket.on('event3', function () {
			socket.broadcast.to(socket.data.room).emit('message', "event3");
		});
	};

	return obj;
};
