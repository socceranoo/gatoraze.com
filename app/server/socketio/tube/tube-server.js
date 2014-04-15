var ALL = 2, ALL_BUT_SENDER = 1, SENDER = 0;
var events = require('../game/events').events;
function player(name, position) {
	this.name = name;
	this.position = position;
}
function tube(num, room) {
	this.room = room;
	this.totalPlayers = num;
	this.addHumanMember = function (newPlayer) {
		var sendData = [];
		var message, position, compName, data, playerObj;
		if (this.members[newPlayer]) {
			message = newPlayer+" duplicate login ";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:{error:true}});
			return [false, sendData];
		}
		if (this.roomFull()) {
			message = "Room "+this.room+" is full try joining someother room";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:{error:true}});
			return [false, sendData];
		}
		position = Object.keys(this.members).length;
		playerObj = new player(newPlayer, position);
		this.members[newPlayer] = playerObj;
		this.playerArr[position] = newPlayer;
		message = "Welcome to the game room "+this.room;
		sendData.push({dest:SENDER, event:events.welcome, message:message, data:this.playerArr});
		message = newPlayer + " joined this room.";
		data = {name:newPlayer, position:position};
		sendData.push({dest:ALL_BUT_SENDER, event:events.playerJoin, message:message, data:data});
		console.log("New player:"+newPlayer+"ROOM COUNT : "+Object.keys(this.members).length);
		sendData.push({dest:ALL , event:events.ready, message:"READY",  data:{players:this.playerArr}});
		return [true, sendData];
	};

	this.removeHumanMember = function (exitingPlayer) {
		var sendData = [];
		var message, position, compName, data, playerObj;
		if (this.members[exitingPlayer]) {
			message = exitingPlayer + " left this room " +this.room;
			playerObj = this.members[exitingPlayer];
			position = playerObj.position;
			data = {name:exitingPlayer, position:position};
			delete this.members[exitingPlayer];
			if (this.humanCount() === 0) {
				this.resetTable();
				console.log("RESET TABLE");
			}
			sendData.unshift({dest:ALL_BUT_SENDER , event:events.playerLeave, message:message,  data:data});
			return sendData;
		}
	};

	this.roomFull = function () {
		return (Object.keys(this.members).length == this.totalPlayers);
	};

	this.humanCount = function () {
		return Object.keys(this.members).length;
	};
	this.getTableInfo = function (retdata) {
		retdata.inProgress = true;
		retdata.total = this.totalPlayers;
		retdata.active = this.humanCount();
		retdata.totalPoints = this.totalPoints;
		retdata.playerInfo = this.playerArr;
	};

	this.resetTable = function () {
		this.video = "";
		this.state = "";
		this.time = "";
		this.members = {};
		this.playerArr = [];
		this.playList = {};
	};
	this.resetTable();

	this.playerPlay = function (data) {
		var sendData = [];
		delete data.userInfo;
		this.nextPlay(data, sendData, true);
	};
}
exports.createGame = function(data) {
	return new tube(data.total, data.room);
};
