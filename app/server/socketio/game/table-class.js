var ALL = 2, ALL_BUT_SENDER = 1, SENDER = 0;
var events = require('./events').events;
var DIFFICULTY_EASY = 0, DIFFICULTY_MEDIUM = 1, DIFFICULTY_HARD = 2;
var REPLACE_COMPUTER_SPECIFIC = 0, REPLACE_COMPUTER_ANY = 1, CHANGE_DIFFICULTY = 2;
/*
 * http://api.randomuser.me/?results=100
 */
var uinames = require("./uinames.json");
var cardClass = require("./card-class");

function player(name, position, human, bio, difficulty) {
	this.name = name;
	this.hand = [];
	this.position = position;
	this.points = 0;
	this.total_points = 0;
	this.wins = 0;
	this.total_games = 0;
	this.team = position%2;
	this.human = human;
	this.bio = bio;
	this.difficulty = difficulty;
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
	this.computerNames = JSON.parse(JSON.stringify(uinames.results));
	cardClass.shuffle(this.computerNames);
	this.timerSetForPlayer = -1;

	this.getUserData = function(userObj) {
		var diff_class = ["fa-car", "fa-plane", "fa-rocket"];
		var diff_name = ["Easy", "Medium", "Hard"];
		console.log(userObj.name);
		var details = {
			username:userObj.name,
			name:userObj.name,
			human:userObj.human,
			wins:userObj.wins+"/"+userObj.total_games,
			position:userObj.position,
			difficulty_class:diff_class[userObj.difficulty],
			difficulty:diff_name[userObj.difficulty]
		};
		if (userObj.human === true) {
			details.name = userObj.name;
			details.gender = "";
			details.thumbnail = "http://4vector.com/i/free-vector-male-user-icon-clip-art_125620_male-user-icon-clip-art/Male_User_Icon_clip_art_hight.png";
			details.type = "Human";
		} else {
			details.name = userObj.bio.name.first+" "+userObj.bio.name.last;
			details.gender = userObj.bio.gender;
			details.thumbnail = userObj.bio.picture.thumbnail;
			details.type = "Bot";
		}
		return details;
	};

	this.getReadyData = function () {
		var details = [];
		for (var i = 0; i < this.playerArr.length; i++) {
			var userObj = this.members[this.playerArr[i]];
			details.push(this.getUserData(userObj));
		}
		return {players:this.playerArr, details:details};
	};

	this.addHumanMember = function (newPlayer) {
		var sendData = [];
		var message, position, compName, data, playerObj;
		if (this.members[newPlayer]) {
			message = newPlayer+" duplicate login ";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:{error:true}});
			return [false, sendData];
		}

		if (Object.keys(this.members).length === 0) {
			position = Object.keys(this.members).length;
			playerObj = new player(newPlayer, position, true, null, 1);
			this.members[newPlayer] = playerObj;
			this.playerArr[position] = newPlayer;
			message = "Welcome to the game room "+this.room;
			sendData.push({dest:SENDER, event:events.welcome, message:message, data:this.playerArr});
			message = newPlayer + " joined this room.";
			while (this.roomFull() === false) {
				this.addComputerMember(newPlayer, DIFFICULTY_EASY, sendData);
			}
			sendData.push({dest:ALL , event:events.ready, message:"READY",  data:this.getReadyData()});
			this.inProgress = true;
			this.startPrePlay(sendData);
			return [true, sendData];
		}
		if (this.roomFull() && this.inProgress === true) {
			message = "Welcome to the game room "+this.room+ " as a viewer";
			sendData.push({dest:SENDER, event:events.welcome, message:message, data:this.playerArr});
			message = newPlayer + " joined this room as a viewer";
			sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:1});
			sendData.push({dest:ALL_BUT_SENDER, event:events.message, message:message, data:null});
			sendData.push({dest:SENDER , event:events.ready, message:"READY",  data:this.getReadyData()});
		}
		return [true, sendData];
	};

	this.addComputerMember = function (adder, difficulty, sendData) {
		var message, position, compName, data, playerObj, bio;
		position = Object.keys(this.members).length;
		bio = this.computerNames[position].user;
		compName = bio.username;
		playerObj = new player(compName, position, false, bio, difficulty);
		this.members[compName] = playerObj;
		this.playerArr[position] = compName;
		data = {name:compName, position:position, inProgress:this.inProgress};
		message = adder+" has added "+compName+" to the room "+this.room;
		sendData.push({dest:ALL, event:events.playerJoin, message:message, data:data});
		console.log(JSON.stringify(this.playerArr));
		return;
	};

	this.changeComputerMember = function (user, input) {
		var sendData = [];
		var message, position, compName, data, playerObj;
		var temp_arr = [DIFFICULTY_EASY, DIFFICULTY_HARD, DIFFICULTY_MEDIUM];
		if (input.mode !== REPLACE_COMPUTER_SPECIFIC &&
				input.mode !== REPLACE_COMPUTER_ANY &&
				input.mode !== CHANGE_DIFFICULTY) {
			message = "Invalid mode specified";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:{error:true}});
			return [false, sendData];
		}
		/*
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
		*/
		if (input.mode == CHANGE_DIFFICULTY) {
			//Only existing user can change the difficulty
			if (this.members[user]) {
				playerObj = this.members[this.playerArr[input.position]];
				//Changing difficulty should happen only for a computer
				if (playerObj.human === false) {
					//Difficulty value should be in valid diffculty levels
					if (temp_arr.indexOf(input.difficulty) >= 0) {
						//change bio and name later
						message = playerObj.name+" has replaced the computer " +playerObj.name;
						playerObj.difficulty = input.difficulty;
						data = {name:playerObj.name, position:input.position, inProgress:this.inProgress, details:this.getUserData(playerObj)};
						sendData.push({dest:ALL, event:events.playerChange, message:message, data:data});
						return [true, sendData];
					} else {
						message = "Invalid difficulty specified";
					}
				} else {
					message = "Invalid player specified";
				}
			} else {
				message = "Only active players can perform this operation";
			}
			sendData.push({dest:SENDER , event:events.message, message:message,  data:{error:true}});
			return [false, sendData];
		}

		if (Object.keys(this.members).length === 0) {
			message = "Room "+this.room+" is empty, Go back to lobby";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:{error:true}});
			return [false, sendData];
		}
		//REPLACE COMPUTER
		if (this.humanCount() == this.totalPlayers) {
			message = "Room "+this.room+" is full try joining someother room";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:{error:true}});
			return [false, sendData];
		}

		if (this.members[user]) {
			message = user+" duplicate login ";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:{error:true}});
			return [false, sendData];
		}

		if (input.mode === REPLACE_COMPUTER_ANY) {
			playerObj = this.getFreePlayer();
		} else {
			playerObj = this.members[this.playerArr[input.position]];
		}
		if (playerObj.human === true) {
			message = "Cannot replace human player "+playerObj.name;
			sendData.push({dest:SENDER , event:events.message, message:message,  data:{error:true}});
			return [false, sendData];
		}
		var newPlayer = user;
		compName = playerObj.name;
		position = playerObj.position;
		delete this.members[compName];
		playerObj.name = newPlayer;
		playerObj.human = true;
		playerObj.bio = null;
		this.members[newPlayer] = playerObj;
		this.playerArr[position] = newPlayer;
		message = "Welcome to the game room "+this.room;
		sendData.push({dest:SENDER, event:events.welcome, message:message, data:this.playerArr});
		message = newPlayer + " joined this room.";
		sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:1});
		this.sendCurrentState(playerObj, sendData);
		message += " has replaced the computer " +compName;
		data = {name:newPlayer, position:position, inProgress:this.inProgress, details:this.getUserData(playerObj)};
		sendData.push({dest:ALL_BUT_SENDER, event:events.playerJoin, message:message, data:data});
		console.log("New player:"+newPlayer+"ROOM COUNT : "+Object.keys(this.members).length);
		return [true, sendData];
	};

	this.removeHumanMember = function (exitingPlayer) {
		var sendData = [];
		var message, position, compName, data, playerObj;
		if (this.members[exitingPlayer]) {
			message = exitingPlayer + " left this room " +this.room;
			playerObj = this.members[exitingPlayer];
			position = playerObj.position;
			delete this.members[exitingPlayer];
			if (this.humanCount() === 0) {
				this.resetTable();
				console.log("RESET TABLE");
			}
			if (this.inProgress === true) {
				var bio = this.computerNames[position].user;
				compName = bio.username;
				message += " and has been replaced by computer "+compName;
				this.members[compName] = playerObj;
				playerObj.human = false;
				playerObj.name = compName;
				playerObj.bio = bio;
				this.playerArr[position] = compName;
				if (this.currentPlayer === position) {
					this.resumeOnPlayerLeave(playerObj, sendData);
				}
			}
			data = {name:compName, position:position, inProgress:this.inProgress, details:this.getUserData(playerObj)};
			sendData.unshift({dest:ALL_BUT_SENDER , event:events.playerLeave, message:message,  data:data});
		}
		return sendData;
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
		this.currentPlayer = 0;
		this.allGames = [];
	};
	this.resetTable();

	this.playerPlay = function (data) {
		var sendData = [];
		delete data.userInfo;
		if (data.play) {
			return this.processNextPlay(data, sendData, true);
		} else {
			return this.processPrePlay(data, sendData);
		}
	};
}

exports.obj = table;
