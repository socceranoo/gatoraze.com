module.exports = function(IO) {
	var io = IO;
	var moment = require('moment');
	var gameObjects = {};
	var gameRooms = {};
	var socketObj = {};
	var trumpObj = require('./trump-game')(socketObj);
	var events = trumpObj.events;
	var dateFormat ="H:mm:ss";
	//var sites = {};
	//sites[trumpObj.site] = trumpObj.site;
	
	//Add more games in this place 
	gameObjects[trumpObj.site] = trumpObj;

	function gameRoom(game, session, room) {
		this.game = game;
		this.room = room;
		this.userSockets = {};
		//Members are maintained in the gameObj.members.
		this.gameObj = gameObjects[game].createGame(game, session, room);

		this.addUser = function (socket, data) {
			var ret = this.gameObj.addMember(data.user);
			var success = ret[0];
			var sendData = ret[1];
			if (success) {
				socketObj.addToRoom(socket, data);
				this.userSockets[data.user] = socket;
			}
			socketObj.sendEventsSocket(this.gameObj.server, socket, sendData, this.userSockets);
			return success;
		};

		this.removeUser = function (socket) {
			var ret = this.gameObj.removeMember(socket.data.user);
			var success = ret[0];
			var sendData = ret[1];
			if (success) {
				socketObj.removeFromRoom(socket);
				delete this.userSockets[socket.data.user];
			}
			socketObj.sendEventsSocket(this.gameObj.server, socket, sendData, this.userSockets);
		};
		this.userPlay = function (socket, data) {
			var sendData = this.gameObj.playerPlay(data);
			socketObj.sendEventsSocket(this.gameObj.server, socket, sendData, this.userSockets);
		};
	}

	var getMoment = function () {
		return moment().format(dateFormat);
	};

	socketObj.sendEventData = function (socketHash, sender, sendData) {
		for (var i = 0; i < sendData.length; i++) {
			socketObj.sendFunction[sendData[i].dest](sender, socketHash[sendData[i].receiver], sendData[i].event, sendData[i].message, sendData[i].data);
			console.log(sendData[i].message);
		}
	};

	socketObj.sendEventsSocket = function (sender, socket, sendData, socketHash) {
		var receiver = socket;
		for (var i = 0; i < sendData.length; i++) {
			if (sendData[i].receiver) {
				receiver = socketHash[sendData[i].receiver];
			}
			socketObj.sendFunction[sendData[i].dest](sender, receiver, sendData[i].event, sendData[i].message, sendData[i].data);
			console.log(sendData[i].message);
		}
	};

	socketObj.addToRoom = function(socket, data) {
		socket.data = data;
		socket.join(data.room);
	};

	socketObj.removeFromRoom = function(socket) {
		socket.leave(socket.data.room);
	};

	//Function 0
	socketObj.sendToEmitter = function(sender, socket, event, message, data) {
		var messageObj = {sender:sender, message:message, data:data, date: getMoment()};
		socket.emit(event, messageObj);

	};

	//Function 1
	socketObj.roomBroadcastExceptSender = function(sender, socket, event, message, data) {
		var messageObj = {sender:sender, message:message, data:data, date: getMoment()};
		socket.broadcast.to(socket.data.room).emit(event, messageObj);
	};

	//Function 3
	socketObj.roomBroadcast = function(sender, socket, event, message, data) {
		var messageObj = {sender:sender, message:message, data:data, date: getMoment()};
		io.sockets.in(socket.data.room).emit(event,  messageObj);
	};

	//Function 4
	socketObj.trumpBroadcast = function(sender, event, message, data) {
		var messageObj = {sender:sender, message:message, data:data, date: getMoment()};
		for (var key in gameRooms) {
			io.sockets.in(key).emit(event,  messageObj);
		}
	};

	socketObj.sendFunction = [socketObj.sendToEmitter, socketObj.roomBroadcastExceptSender, socketObj.roomBroadcast,  socketObj.trumpBroadcast];

	socketObj.site = trumpObj.site;
	socketObj.userJoin = function (socket, data) {
		socket.on(events.message, function (message) {
			socketObj.roomBroadcastExceptSender(socket.data.user, socket, events.message, message, null);
		});

		if (!gameRooms[data.room]) {
			gameRooms[data.room] = new gameRoom(data.site, data.session, data.room);	
		}
		var gameRoomObj = gameRooms[data.room];
		if (gameRoomObj.addUser(socket, data)) {
			socket.on('event1', function () {
				socketObj.roomBroadcast(trumpObj.server, socket, events.message, "event1", null);
			});
			socket.on(events.play, function (data) {
				var gameRoomObj = gameRooms[data.userInfo.room];
				gameRoomObj.userPlay(socket, data);
			});
		}
	};

	socketObj.userLeave = function (socket) {
		var gameRoomObj = gameRooms[socket.data.room];
		if (gameRoomObj) {
			gameRoomObj.removeUser(socket);
		}
	};
	return socketObj;
};
