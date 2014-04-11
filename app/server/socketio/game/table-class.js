var ALL = 2, ALL_BUT_SENDER = 1, SENDER = 0;
var events = require('./events').events;
function player(name, position, human) {
	this.name = name;
	this.hand = [];
	this.position = position;
	this.points = 0;
	this.team = position%2;
	this.human = human;
}
player.prototype.getCardSet = function (set) {
	var first_set = parseInt(this.hand.length / 2 , 10);
	var second_set = this.hand.length - first_set;
	var start = (set == 1) ? 0 : first_set;
	var end = (set == 1) ? first_set : this.hand.length;
	var ret = this.hand.slice(start, end);
	return ret;
};

function table(num, room) {
	this.addHumanMember = function (newPlayer) {
		var sendData = [];
		var message, position, compName, data, playerObj;
		if (this.members[newPlayer]) {
			message = newPlayer+" duplicate login ";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:{error:true}});
			return [false, sendData];
		}
		if (this.humanCount == this.totalPlayers) {
			message = "Room "+this.room+" is full try joining someother room";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:{error:true}});
			return [false, sendData];
		}
		if (this.inProgress === true) {
			playerObj = this.getFreePlayer();
			compName = playerObj.name;
			playerObj.name = newPlayer;
			playerObj.human = true;
			position = playerObj.position;
			this.members[newPlayer] = playerObj;
			delete this.members[compName];
		} else {
			position = Object.keys(this.members).length;
			playerObj = new player(newPlayer, position, true);
			this.members[newPlayer] = playerObj;
		}
		this.playerArr[position] = newPlayer;
		message = "Welcome to the game room "+this.room;
		sendData.push({dest:SENDER, event:events.welcome, message:message, data:this.playerArr});
		message = newPlayer + " joined this room.";
		if (this.inProgress === true) {
			sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:1});
			this.sendCurrentState(playerObj, sendData);
			message += " has replaced the computer " +compName;
		}
		data = {name:newPlayer, position:position, inProgress:this.inProgress};
		sendData.push({dest:ALL_BUT_SENDER, event:events.playerJoin, message:message, data:data});
		console.log("New player:"+newPlayer+"ROOM COUNT : "+Object.keys(this.members).length);
		if (this.roomFull()) {
			if (this.inProgress === false) {
				sendData.push({dest:ALL , event:events.ready, message:"READY",  data:{players:this.playerArr}});
				this.inProgress = true;
				this.startPrePlay(sendData);
			}
		}
		return [true, sendData];
	};
	this.addComputerMember = function (adder) {
		var sendData = [];
		var message, position, compName, data, playerObj;
		if (this.inProgress === true) {
			message = "Cannot add computer when game is in progress";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:{error:true}});
			return [false, sendData];
		}
		if (this.roomFull()) {
			message = "Cannot add computer since the room is already full";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:{error:true}});
			return [false, sendData];
		}
		position = Object.keys(this.members).length;
		compName = 'Computer'+position;
		playerObj = new player(compName, position, false);
		this.members[compName] = playerObj;
		this.playerArr[position] = compName;
		data = {name:compName, position:position, inProgress:this.inProgress};
		message = adder+" has added "+compName+" to the room "+this.room;
		sendData.push({dest:ALL, event:events.playerJoin, message:message, data:data});
		if (this.roomFull()) {
			if (this.inProgress === false) {
				sendData.push({dest:ALL , event:events.ready, message:"READY",  data:{players:this.playerArr, round:this.currentRound}});
				this.inProgress = true;
				this.startPrePlay(sendData);
			}
		}
		return [true, sendData];
	};

	this.removeHumanMember = function (exitingPlayer) {
		var sendData = [];
		var message, position, compName, data, playerObj;
		if (this.members[exitingPlayer]) {
			message = exitingPlayer + " left this room " +this.room;
			playerObj = this.members[exitingPlayer];
			position = playerObj.position;
			data = {name:exitingPlayer, position:position, inProgress:this.inProgress};
			delete this.members[exitingPlayer];
			if (this.humanCount() === 0) {
				this.resetTable();
				console.log("RESET TABLE");
			}
			if (this.inProgress === true) {
				compName = "Computer"+position;
				message += " and has been replaced by computer "+compName;
				this.members[compName] = playerObj;
				playerObj.human = false;
				playerObj.name = compName;
				data.name = compName;
				this.playerArr[position] = compName;
				if (this.currentPlayer === position) {
					this.resumeOnPlayerLeave(playerObj, sendData);
				}
			}
			sendData.unshift({dest:ALL_BUT_SENDER , event:events.playerLeave, message:message,  data:data});
			return [true, sendData];
		}
	};

	this.humanCount = function () {
		var count = 0;
		for (var key in this.members) {
			var userObj = this.members[key];
			if (userObj.human === true) {
				count++;
			}
		}
		return count;
	};
	this.roomFull = function () {
		return (Object.keys(this.members).length == this.totalPlayers);
	};

	this.getFreePlayer = function () {
		for (var key in this.members) {
			var userObj = this.members[key];
			if (userObj.human === false) {
				return userObj;
			}
		}
	};

	this.getTableInfo = function (retdata) {
		retdata.inProgress = this.inProgress;
		retdata.total = this.totalPlayers;
		retdata.active = this.humanCount();
		retdata.totalPoints = this.totalPoints;
		retdata.playerInfo = this.playerArr;
	};

	this.resetTable = function () {
		this.inProgress = false;
		this.members = {};
		this.playerArr = [];
		this.gameStarter = 0;
		this.games = [];
		this.gameCount = 0;
	};
	this.resetTable();

	this.startPlay = function (sendData) {
		this.currentPlayer = this.gameStarter;
		var playerObj = this.members[this.playerArr[this.currentPlayer]];
		this.prePlayOver = true;
		this.sendPreGameInfo(sendData, 2);
		if (playerObj.human === false) {
			var cardData = {play:true, player:this.currentPlayer, cardObj:{}};
			this.computerPlay(playerObj, cardData, sendData);
		}else {
			sendData.push({dest:ALL, event:events.play, message:"PLAY",
				data:{play:true, player:this.currentPlayer, cardObj:null}
			});
		}
	};

	this.playerPlay = function (data) {
		var sendData = [];
		delete data.userInfo;
		if (data.play) {
			return this.nextPlay(data, sendData, true);
		} else {
			return this.nextPrePlay(data, sendData);
		}
	};
}

exports.obj = table;
