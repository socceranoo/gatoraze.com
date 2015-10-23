module.exports = function(IO) {
	var io = IO;
	var moment = require('moment');
	var sleep = require('sleep');
	var waitfor = require('waitfor');
	var socketRoomsHash = {};
	var exportObj = {};
	var events = require('./game/events').events;
	var game_table = require('./game/game-table');
	var servers = {
		trump: {name:"Trump", image:"trump.png", background:"metroJade", info:{game:[4, 6, 8], icon:'user'}, sessionCount: 0, tableObj:game_table},
		spades: {name:"Spades", image:"spades.png", background:"metroOrange", info:{game:[4], icon:'user'}, sessionCount: 0, tableObj:game_table},
		hearts:{name:"Hearts", image:"QH.png", background:"metroYellow", info:{game:[4], icon:'heart'}, sessionCount:0, tableObj:game_table},
		tube:{name:"Connectube", image:"tube.png", background:"peterRiver", info:{game:[""], icon:'facetime-video'}, sessionCount:0, tableObj:require('./tube/tube-server.js')}
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
		this.timeoutObject = null;
		//Members are maintained in the gameTable.members.
		this.gameTable = servers[this.game].tableObj.createGame(data);

		this.checkUserInfo = function (data) {
			return (this.game == data.site && this.room == data.room &&
				this.session == data.session && this.total == data.total);
		};

		this.addUser = function (socket, data) {
			var ret = this.gameTable.addHumanMember(data.user);
			var success = ret[0];
			var sendData = ret[1];
			if (success === true) {
				addToRoom(socket, data);
				this.userSockets[data.user] = socket;
			}
			this.sendEventsSocket(socket, sendData);
			return success;
		};

		this.changeComputer = function (socket, userInfo, data) {
			var ret = this.gameTable.changeComputerMember(userInfo.user, data);
			var success = ret[0];
			var sendData = ret[1];
			this.sendEventsSocket(socket, sendData);
		};

		this.removeUser = function (socket) {
			console.log("CLOSING SOCKET:"+JSON.stringify(socket.data));
			removeFromRoom(socket);
			delete this.userSockets[socket.data.user];
			var sendData = this.gameTable.removeHumanMember(socket.data.user);
			if (this.gameTable.humanCount() === 0 && this.timeoutObject !== null) {
				clearTimeout(this.timeoutObject);
				this.timeoutObject = null;
			}
			this.sendEventsSocket(socket, sendData);
		};
		this.userPlay = function (socket, data, sendData) {
			if (sendData === null) {
				sendData = this.gameTable.playerPlay(data);
				if (this.timeoutObject !== null) {
					clearTimeout(this.timeoutObject);
					this.timeoutObject = null;
				}
			}
			this.sendEventsSocket(socket, sendData);
		};

		this.sendEventsSocket = function(socket, sendData) {
			//Else it is recursion of the timer
			//console.log(JSON.stringify(sendData));
			var timerData = sendEventsSocket(this.game, socket, sendData, this.userSockets);
			//console.log(this.timeoutObject);
			if (timerData !== null) {
				//console.log("TIMER Starting for "+timerData.time/1000+" seconds");
				var self = this;
				this.timeoutObject = setTimeout(function () {
					var newSendData = [];
					//console.log(this.room);
					//console.log(JSON.stringify(this.gameTable.trump));
					timerData.callback(timerData, newSendData);
					this.userPlay(socket, data, newSendData);
				}.bind(this), timerData.time);
			}
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
			if (sendData[i].event == events.sleep) {
				sleep.usleep(sendData[i].data);
				continue;
			}
			if (sendData[i].receiver) {
				receiver = socketHash[sendData[i].receiver];
			}
			if (receiver === undefined) {
				console.log("RECEIVER is undefined ASSERT:"+JSON.stringify(sendData[i]));
			}
			if (sendData[i].event == events.timer) {
				//ASSUMING TIMER WILL ALWAYS BE LAST// OPtimize for in between timers later
				return sendData[i].data;
			}
			sendFunction[sendData[i].dest](sender, receiver, sendData[i].event, sendData[i].message, sendData[i].data);
			//console.log(sendData[i].message);
		}
		return null;
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
		var socketRoomObj = socketRoomsHash[data.site][data.room];
		if (!socketRoomObj) {
			console.log(data);
			return;
		}
		if (socketRoomObj.checkUserInfo(data) === false) {
			return;
		}
		var success = socketRoomObj.addUser(socket, data);
		if (success) {
			socket.on(events.message, function (message) {
				roomBroadcastExceptSender(socket.data.user, socket, events.message, message, null);
			});
			socket.on(events.play, function (data) {
				console.log(JSON.stringify(data));
				var socketRoomObj = socketRoomsHash[data.userInfo.site][data.userInfo.room];
				socketRoomObj.userPlay(socket, data, null);
			});
			socket.on(events.changeComputer, function (data) {
				var socketRoomObj = socketRoomsHash[data.userInfo.site][data.userInfo.room];
				socketRoomObj.changeComputer(socket, data.userInfo, data);
			});
		}
	};

	exportObj.userLeave = function (socket) {
		var socketRoomObj = socketRoomsHash[socket.data.site][socket.data.room];
		if (socketRoomObj) {
			socketRoomObj.removeUser(socket);
		}
	};
	exportObj.availableServers = Object.keys(servers);
	exportObj.servers = servers;

	exportObj.getRoomInfo = function (site, room) {
		var socketRoomObj = socketRoomsHash[site][room];
		if (socketRoomObj) {
			return socketRoomObj.getRoomInfo();
		} else {
			return null;
		}
	};
	exportObj.initializeSocketRoom = function (site, session, room, total) {
		var data = {site:site, session:session, room:room, total:total};
		var socketRoomObj = socketRoomsHash[site][room];
		if (!socketRoomObj) {
			socketRoomsHash[data.site][data.room] = new socketRoom(data);
			servers[site].sessionCount++;
		}
		return true;
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
