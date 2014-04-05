var cardClass = require('./card-class');
var ALL = 2, ALL_BUT_SENDER = 1, SENDER = 0;
var sleepSeconds = 0.0 * 200000;
var events = require('./events').events;
var gameEngine = require('./trump-engine');

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
	//cardObj.display(ret);
	return ret;
};
function table(num, room) {
	var autoBid = true;
	this.room = room;
	this.totalPoints = gameEngine.getTotalPoints(num);
	this.cardDeck = gameEngine.pruneCardDeck(cardClass.createCardDeck(), num);
	this.totalPlayers = num;
	this.handCount = parseInt(this.cardDeck.length/this.totalPlayers, 10);
	this.trump = {card:null, setter:-1, points:0, revealed:false, revealer:-1, revealRound:-1, revealPosition:-1};
	this.games = [];

	this.resetTrump = function () {
		this.trump.card =null;
		this.trump.setter = -1;
		this.trump.points = 0;
		this.trump.revealed = false;
		this.trump.revealer = -1;
		this.trump.revealRound = -1;
		this.trump.revealPosition = -1;
	};
	this.resetTable = function () {
		this.inProgress = false;
		this.members = {};
		this.playerArr = [];
		this.gameStarter = 0;
	};
	this.resetTable();

	this.initValues = function () {
		this.resetTrump();
		this.currentRound = [];
		this.round = [];
		this.bidData = [];
		this.bidCount = 0;
		this.minimumBid = gameEngine.getMinimumBid(this.totalPoints, 0);
		this.currentBid = this.minimumBid;
		this.firstBid = this.minimumBid;
		this.biddingOver = false;
	};

	this.getTableInfo = function (retdata) {
		retdata.inProgress = this.inProgress;
		retdata.total = this.totalPlayers;
		retdata.active = this.humanCount();
		retdata.totalPoints = this.totalPoints;
		retdata.playerInfo = this.playerArr;
	};

	this.addHumanMember = function (newPlayer) {
		var sendData = [];
		var message, position, compName, data, playerObj;
		if (this.members[newPlayer]) {
			message = newPlayer+" duplicate login ";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:null});
			return [false, sendData];
		}
		if (this.humanCount == this.totalPlayers) {
			message = "Room "+this.room+" is full try joining someother room";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:null});
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
			sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:sleepSeconds});
			sendData.push({dest:SENDER, event:events.cards, message:"CARDS",  data:{set:1, cards:playerObj.getCardSet(1)}});
			if (this.biddingOver === true) {
				sendData.push({dest:SENDER, event:events.cards, message:"CARDS",  data:{set:1, cards:playerObj.getCardSet(2)}});
				sendData.push({dest:SENDER, event:events.ready, message:"READY", data:{inProgress:true, players:this.playerArr, round:this.currentRound, trumpData:{setter:this.trump.setter, points:this.trump.points, revealed:this.trump.revealed, card:(this.trump.revealed === true)?this.trump.card:null }}});
			} else {
				sendData.push( {dest:SENDER, event:events.ready, message:"READY",
					data:{inProgress:true, players:this.playerArr, bidData:this.bidData, trumpData:{setter:this.trump.setter, points:this.trump.points}}
				});
				if (this.trump.card !== null) {
					sendData.push({dest:SENDER, event:events.cards, message:"CARDS",  data:{set:1, cards:playerObj.getCardSet(2)}});
				}
			}
			message += " has replaced the computer " +compName;
		}
		data = {name:newPlayer, position:position, inProgress:this.inProgress};
		sendData.push({dest:ALL_BUT_SENDER, event:events.playerJoin, message:message, data:data});
		if (this.roomFull()) {
			if (this.inProgress === false) {
				sendData.push({dest:ALL , event:events.ready, message:"READY",  data:{players:this.playerArr, round:this.currentRound}});
				this.inProgress = true;
				this.startBid(sendData);
			}
		}
		return [true, sendData];
	};
	this.addComputerMember = function (adder) {
		var sendData = [];
		var message, position, compName, data, playerObj;
		if (this.inProgress === true) {
			message = "Cannot add computer when game is in progress";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:null});
			return [false, sendData];
		}
		if (this.roomFull()) {
			message = "Cannot add computer since the room is already full";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:null});
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
				this.startBid(sendData);
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
					if (this.biddingOver === true) {
						var cardData = {play:true, player:this.currentPlayer, cardObj:{}};
						this.computerPlay(playerObj, cardData, sendData);
					} else {
						var bidObj = {bid:true, bidder:this.currentBidder, points:this.currentBid };
						var bidData = {player:this.currentPlayer, trump:null, play:false, bidObj:bidObj};
						this.computerBid(playerObj, bidData, sendData);
					}
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
	this.setPlayerCards = function (playerObj, start, end) {
		playerObj.hand = [];
		for (var i = start; i < end; i++) {
			playerObj.hand.push(this.cardDeck[i]);
		}
	};
	this.setNewGame = function (sendData, autoBid) {
		cardClass.shuffle(this.cardDeck);
		var i = 1, j = 0;
		for (var key in this.members) {
			j = i-1;
			var userObj = this.members[key];
			this.setPlayerCards(userObj, j, j+this.handCount);
			i+= this.handCount;
			if (userObj.human === true) {
				sendData.push({dest:SENDER, receiver:userObj.name, event:events.cards, message:"Cards",  data:{set:1, cards:userObj.getCardSet(1)}});
				//Testing
				if (autoBid === true)
					sendData.push({dest:SENDER, receiver:userObj.name, event:events.cards, message:"Cards",  data:{set:2, cards:userObj.getCardSet(2)}});
			}
		}
	};
	this.updatePoints = function (winner, points) {
		for (var key in this.members) {
			var userObj = this.members[key];
			if (userObj.position % 2 === winner % 2) {
				userObj.points += points;
			}
		}
	};

	this.sendTrumpInfo = function (sendData, round) {
		var index = -1;
		var cardArr = this.members[this.playerArr[this.trump.setter]].hand;
		for (var i = 0 ; i < cardArr.length; i++) {
			if (this.trump.card.name == cardArr[i].name) {
				index = i;
			}
		}
		sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:sleepSeconds});
		sendData.push({dest:ALL, event:events.play, message:"PLAY",
			data:{play:false, player:-1, bidObj:{bid:false, bidder:this.trump.setter, points:this.trump.points, trump:true, round:round, index:index}}
		});
	};
	this.startPlaying = function (sendData) {
		this.currentPlayer = this.gameStarter;
		var playerObj = this.members[this.playerArr[this.currentPlayer]];
		this.sendTrumpInfo(sendData, 2);
		this.biddingOver = true;
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
			return this.nextPlayer(data, sendData, true);
		} else {
			return this.nextBidder(data, sendData);
		}
	};

	this.continueRound = function (data, sendData) {
		var validObj;
		var playerObj = this.members[this.playerArr[this.currentPlayer]];
		var retval = false;
		if (data.reveal === true) {
			validObj = gameEngine.revealTrump(playerObj, this.currentRound, this.trump);
			if (validObj[0] === true) {
				data.card = this.trump.card;
				this.trump.revealed = true;
				this.trump.revealer = this.currentPlayer;
				this.trump.revealRound = this.round.length;
				this.trump.revealPosition = this.currentRound.length;
				sendData.push({dest:ALL, event:events.play, message:validObj[1],  data:data});
			} else {
				data.card = null;
				sendData.push({dest:SENDER, event:events.play, message:validObj[1],  data:data});
			}
		} else {
			validObj = gameEngine.isValidCard(playerObj, data.cardObj.card, this.currentRound, this.round.length, this.trump);
			if (validObj[0] === false) {
				data.cardObj = null;
				sendData.push({dest:SENDER, event:events.play, message:validObj[1],  data:data});
				retval = false;
			} else {
				retval = true;
			}
		}
		return retval;
	};

	this.nextPlayer = function (data, sendData, human) {
		var playerObj;
		if (human) {
			if(!this.continueRound(data, sendData)) {
				return sendData;
			}
		}
		this.currentPlayer++;
		this.currentPlayer %= this.totalPlayers;
		this.currentRound.push(data.cardObj);
		var userObj = this.members[this.playerArr[data.cardObj.player]];
		userObj.hand.splice(data.cardObj.index, 1);
		if (this.currentRound.length == this.totalPlayers) {
			var roundWinner = gameEngine.processRound(this.currentRound, null);
			sendData.push({dest:ALL, event:events.play, message:"PLAY",  data:{play:true, player:-1, cardObj:data.cardObj}});
			sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:sleepSeconds});
			sendData.push({dest:ALL, event:events.round, message:"Round",  data:{prevRound:this.currentRound, winner:roundWinner}});
			this.updatePoints(roundWinner.player, roundWinner.points);
			this.round.push(this.currentRound);
			this.currentRound = [];
			if (this.round.length === this.handCount) {
				sendData.push({dest:ALL, event:events.game, message:"Game",  data:{prevGame:this.round, winner:true}});
				this.round = [];
				this.gameStarter++;
				this.gameStarter %= this.totalPlayers;
				this.startBid(sendData);
			} else {
				this.currentPlayer = roundWinner.player;
				sendData.push({dest:ALL, event:events.play, message:"PLAY",  data:{play:true, player:this.currentPlayer, cardObj:null}});
			}
		} else {
			data.player = this.currentPlayer;
			sendData.push({dest:ALL, event:events.play, message:"PLAY",  data:data});
		}
		playerObj = this.members[this.playerArr[this.currentPlayer]];
		if (playerObj.human === false) {
			var newData = JSON.parse(JSON.stringify(data));
			this.computerPlay(playerObj, newData, sendData);
		}
		return sendData;
	};
	this.computerPlay = function (playerObj, data, sendData) {
		sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:sleepSeconds});
		var bestCard = gameEngine.bestCard(playerObj, this.currentRound, this.trump);
		if (this.trump.revealed === false && bestCard.reveal) {
			var message = "Trump revealed by "+playerObj.name;
			console.log(message);
			this.trump.revealed = true;
			this.trump.revealer = this.currentPlayer;
			this.trump.revealRound = this.round.length;
			this.trump.revealPosition = this.currentRound.length;
			sendData.push({dest:ALL, event:events.play, message:message,  data:{play:true, player:this.currentPlayer, reveal:true, card:this.trump.card}});
			sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:2});
		}
		data.cardObj.card = bestCard.card;
		data.cardObj.index = bestCard.index;
		data.cardObj.player = this.currentPlayer;
		this.nextPlayer(data, sendData, false);
	};
	this.computerBid = function (playerObj, data, sendData) {
		sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:sleepSeconds});
		var bestBid = gameEngine.bestBid(playerObj, data.bidObj, this.trump.card);
		data.bidObj.minimum = false;
		if (bestBid.pass && bestBid.pass === true) {
			data.pass = bestBid.pass;
		} else {
			data.bidObj.points = bestBid.points;
			data.bidObj.bidder = this.currentPlayer;
		}
		this.nextBidder(data, sendData);
	};

	this.startBid = function (sendData) {
		this.initValues();
		this.currentPlayer = this.gameStarter;
		this.currentBidder = this.gameStarter;
		this.setNewGame(sendData, autoBid);
		var bidObj = {minimum:true, bid:true, bidder:this.currentPlayer, points:this.minimumBid };
		var data = {player:this.currentPlayer, trump:null, play:false, bidObj:bidObj};
		var playerObj = this.members[this.playerArr[this.currentPlayer]];

		if (autoBid === false) {
			if (playerObj.human === false) {
				this.computerBid(playerObj, data, sendData);
			} else {
				sendData.push({dest:ALL, event:events.play, message:"PLAY", data:data});
			}
		} else {
			var trumpcard = gameEngine.setTrump(playerObj, this.trump);
			this.trump.card = trumpcard;
			this.trump.setter = this.currentPlayer;
			this.trump.points = this.minimumBid;
			this.startPlaying(sendData);
		}
	};

	this.nextBidder = function (data, sendData) {
		var trumpData, bestBid;
		var playerObj;
		if (data.trump !== null) {
			this.firstBid = this.currentBid;
			this.bidData = [];
			if (this.trump.card !== null) {
				this.trump.card = data.trump;
				this.trump.setter = data.bidObj.bidder;
				this.trump.points = data.bidObj.points;
				this.startPlaying(sendData);
				return sendData;
			} else  {
				this.trump.card = data.trump;
				this.trump.setter = data.bidObj.bidder;
				this.trump.points = data.bidObj.points;
				this.sendTrumpInfo(sendData, 1);
				for (var key in this.members) {
					var userObj = this.members[key];
					if (userObj.human)
						sendData.push({dest:SENDER, receiver:userObj.name, event:events.cards, message:"Cards",  data:{set:2, cards:userObj.getCardSet(2)}});
				}
				this.currentPlayer = this.gameStarter;
				data.bidObj.bid = true;
				data.bidObj.points = gameEngine.getMinimumBid(this.totalPoints, 1);
				data.bidObj.bidder = this.currentPlayer;
				data.trump = null;
				data.player = this.currentPlayer;
				playerObj = this.members[this.playerArr[data.player]];
				if (playerObj.human === false) {
					var secondData = JSON.parse(JSON.stringify(data));
					this.computerBid(playerObj, data, sendData);
				} else {
					sendData.push({dest:ALL, event:events.play, message:"PLAY",  data:data});
				}
			}
		} else {
			var dupData = JSON.parse(JSON.stringify(data));
			dupData.player = -1;
			dupData.play = false;
			dupData.bidObj.bid = false;
			dupData.bidObj.trump = false;
			dupData.bidObj.bidder = data.player;
			sendData.push({dest:ALL, event:events.play, message:"PLAY", data:dupData});
			if (this.currentBid < data.bidObj.points && data.pass !== true) {
				data.bidObj.bidder = this.currentPlayer;
				this.currentBid = data.bidObj.points;
				this.currentBidder = this.currentPlayer;
				this.bidData.push([this.currentPlayer, this.currentBid]);
			} else {
				this.bidData.push([this.currentPlayer, "-"]);
			}
			delete data.pass;
			this.bidCount++;
			this.currentPlayer++;
			this.currentPlayer %= this.totalPlayers;
			if (this.bidCount == this.totalPlayers) {
				if (this.members[this.playerArr[data.bidObj.bidder]].human === false) {
					trumpData = JSON.parse(JSON.stringify(data));
					trumpData.trump = gameEngine.setTrump(this.members[this.playerArr[trumpData.bidObj.bidder]], this.trump);
					this.nextBidder(trumpData, sendData);
				} else {
					data.bidObj.bid = false;
					data.player = data.bidObj.bidder;
					sendData.push({dest:ALL, event:events.play, message:"PLAY",  data:data});
				}
			} else if (this.bidCount == 2 * this.totalPlayers) {
				this.bidCount = 0;
				if (this.firstBid == this.currentBid) {
					this.startPlaying(sendData);
					return sendData;
				}
				if (this.members[this.playerArr[data.bidObj.bidder]].human === false) {
					trumpData = JSON.parse(JSON.stringify(data));
					trumpData.trump = gameEngine.setTrump(this.members[this.playerArr[trumpData.bidObj.bidder]], this.trump);
					this.nextBidder(trumpData, sendData);
				} else {
					data.bidObj.bid = false;
					data.bidObj.points = this.currentBid;
					data.player = data.bidObj.bidder;
					//console.log(JSON.stringify(data));
					sendData.push({dest:ALL, event:events.play, message:"PLAY",  data:data});
				}
			} else {
				playerObj = this.members[this.playerArr[this.currentPlayer]];
				if (playerObj.human === false) {
					var newData = JSON.parse(JSON.stringify(data));
					newData.player = this.currentPlayer;
					this.computerBid(playerObj, newData, sendData);
				} else {
					data.player = this.currentPlayer;
					sendData.push({dest:ALL, event:events.play, message:"PLAY",  data:data});
				}
			}
		}
		return sendData;
	};
}
exports.createGame = function(data) {
	return new table(data.total, data.room);
};
