module.exports = function(IO) {
	var io = IO;
	var moment = require('moment');
	var sleep = require('sleep');
	var socketRoomsHash = {};
	var exportObj = {};
	var events = require('./game/events').events;
	var servers = {
		trump: {name:"trump", sessionCount: 0, tableObj:require('./game/trump/trump-table')},
		hearts:{name:"hearts", sessionCount:0, tableObj:require('./game/hearts/hearts-table')},
		tube:{name:"tube", sessionCount:0, tableObj:require('./tube/tube-server.js')}
	};
	for (var key in servers) {
		socketRoomsHash[key] = {};
	}


	function socketRoom(data) {
		this.game = data.site;
		this.room = data.room;
		this.session = data.session;
		this.total = data.total;
		this.userSockets = {};
		//Members are maintained in the gameTable.members.
		this.gameTable = servers[this.game].tableObj.createGame(data);

		this.addUser = function (socket, data) {
			var ret = this.gameTable.addHumanMember(data.user);
			var success = ret[0];
			var sendData = ret[1];
			if (success) {
				addToRoom(socket, data);
				this.userSockets[data.user] = socket;
			}
			sendEventsSocket(this.game, socket, sendData, this.userSockets);
			return success;
		};

		this.addComputer = function (socket, data) {
			var ret = this.gameTable.addComputerMember(data.user);
			var success = ret[0];
			var sendData = ret[1];
			sendEventsSocket(this.game, socket, sendData, this.userSockets);
		};
		this.removeUser = function (socket) {
			removeFromRoom(socket);
			delete this.userSockets[socket.data.user];
			var sendData = this.gameTable.removeHumanMember(socket.data.user);
			sendEventsSocket(this.game, socket, sendData, this.userSockets);
		};
		this.userPlay = function (socket, data) {
			var sendData = this.gameTable.playerPlay(data);
			//console.log(JSON.stringify(sendData));
			sendEventsSocket(this.game, socket, sendData, this.userSockets);
		};
		this.getRoomInfo = function () {
			var retdata = {game:this.game, room:this.room, session:this.session};
			this.gameTable.getTableInfo(retdata);
			return retdata;
		};
	}
	var getMoment = function () {
		var dateFormat ="H:mm:ss";
		return moment().format(dateFormat);
	};

	var sendEventData = function (socketHash, sender, sendData) {
		for (var i = 0; i < sendData.length; i++) {
			sendFunction[sendData[i].dest](sender, socketHash[sendData[i].receiver], sendData[i].event, sendData[i].message, sendData[i].data);
			//console.log(sendData[i].message);
		}
	};

	var sendEventsSocket = function (sender, socket, sendData, socketHash) {
		var receiver = socket;
		for (var i = 0; i < sendData.length; i++) {
			//console.log(JSON.stringify(sendData[i]));
			if (sendData[i].event == "sleep") {
				sleep.usleep(sendData[i].data);
				continue;
			}
			if (sendData[i].receiver) {
				receiver = socketHash[sendData[i].receiver];
			}
			sendFunction[sendData[i].dest](sender, receiver, sendData[i].event, sendData[i].message, sendData[i].data);
			//console.log(sendData[i].message);
		}
	};

	var addToRoom = function(socket, data) {
		socket.data = data;
		socket.join(data.room);
	};

	var removeFromRoom = function(socket) {
		socket.leave(socket.data.room);
	};

	//Function 0
	var sendToEmitter = function(sender, socket, event, message, data) {
		var messageObj = {sender:sender, message:message, data:data, date: getMoment()};
		socket.emit(event, messageObj);

	};
	//Function 1
	var roomBroadcastExceptSender = function(sender, socket, event, message, data) {
		var messageObj = {sender:sender, message:message, data:data, date: getMoment()};
		socket.broadcast.to(socket.data.room).emit(event, messageObj);
	};
	//Function 3
	var roomBroadcast = function(sender, socket, event, message, data) {
		var messageObj = {sender:sender, message:message, data:data, date: getMoment()};
		io.sockets.in(socket.data.room).emit(event,  messageObj);
	};
	//Function 4
	var serverBroadcast = function(sender, event, message, data) {
		var messageObj = {sender:sender, message:message, data:data, date: getMoment()};
		for (var key in socketRoomsHash) {
			for (var key2 in socketRoomsHash[key]) {
				io.sockets.in(key2).emit(event,  messageObj);
			}
		}
	};
	var sendFunction = [sendToEmitter, roomBroadcastExceptSender, roomBroadcast,  serverBroadcast];

	exportObj.userJoin = function (socket, data) {
		socket.on(events.message, function (message) {
			roomBroadcastExceptSender(socket.data.user, socket, events.message, message, null);
		});

		if (!socketRoomsHash[data.site][data.room]) {
			//console.log(data);
			socketRoomsHash[data.site][data.room] = new socketRoom(data);
			servers[data.site].sessionCount++;
		}
		var gameRoomObj = socketRoomsHash[data.site][data.room];
		if (gameRoomObj.addUser(socket, data)) {
			socket.on(events.play, function (data) {
				var gameRoomObj = socketRoomsHash[data.userInfo.site][data.userInfo.room];
				gameRoomObj.userPlay(socket, data);
			});
			socket.on(events.addComputer, function (data) {
				var gameRoomObj = socketRoomsHash[data.userInfo.site][data.userInfo.room];
				gameRoomObj.addComputer(socket, data.userInfo);
			});
		}
	};

	exportObj.userLeave = function (socket) {
		var gameRoomObj = socketRoomsHash[socket.data.site][socket.data.room];
		if (gameRoomObj) {
			gameRoomObj.removeUser(socket);
		}
	};
	exportObj.availableServers = Object.keys(servers);

	exportObj.getRoomInfo = function (site, room) {
		var gameRoomObj = socketRoomsHash[site][room];
		if (gameRoomObj) {
			return gameRoomObj.getRoomInfo();
		} else {
			return null;
		}
	};
	exportObj.getSessionCount = function (site) {
		return servers[site].sessionCount;
	};

	exportObj.getActiveRooms = function (site, retdata) {
		var socketRoomObj = null;
		for (var key in socketRoomsHash[site]) {
			socketRoomObj = socketRoomsHash[site][key];
			retdata.push(socketRoomObj.getRoomInfo());
		}
	};
	return exportObj;
};
