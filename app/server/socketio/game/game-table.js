var cardObj = require('./card-class');
var trumpEngine = require('./trump-engine');
var ALL = 2, ALL_BUT_SENDER = 1, SENDER = 0;
var sleepSeconds = 0;
var events = {
	message:"message", welcome:"welcome", playerJoin:"player-join", playerLeave:"player-leave", cards:"cards", play:"play", ready:"ready",
	game:"game", round:"round", addComputer: "add-computer", removeComputer:"remove-computer", sleep:"sleep"
};
exports.events = events;
exports.site = trumpEngine.site;
exports.server = trumpEngine.server;

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
	this.masterCardDeck = cardObj.createCardDeck();
	this.totalPlayers = num;
	this.totalPoints = 28;
	this.cardDeck = trumpEngine.pruneCardDeck(this.masterCardDeck, num, 4);
	this.handCount = parseInt(this.cardDeck.length/this.totalPlayers, 10);
	this.trump = {card:null, setter:'', points:'', revealed:false};
	this.games = [];

	this.resetTrump = function () {
		this.trump.card =null;
		this.trump.setter = '';
		this.trump.points = '';
		this.trump.revealed = false;
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
		this.minimumBid = trumpEngine.getMinimumBid(this.totalPoints, 0);
		this.currentBid = this.minimumBid;
		this.firstBid = this.minimumBid;
		this.biddingOver = false;
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
				sendData.push({dest:SENDER, event:events.ready, message:"READY", data:{inProgress:true, players:this.playerArr, round:this.currentRound}});
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
						var bestCard = trumpEngine.bestCard(playerObj, this.currentRound, this.trump.card);
						var cardData = {play:true, player:this.currentPlayer, cardObj:{card:bestCard.card, index:bestCard.index, player:position}};
						this.nextPlayer(cardData, sendData, false);
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
		cardObj.shuffle(this.cardDeck);
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
		sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:sleepSeconds});
		sendData.push({dest:ALL, event:events.play, message:"PLAY",
			data:{play:false, player:-1, bidObj:{bid:false, bidder:this.trump.setter, points:this.trump.points, trump:true, round:round}}
		});
	};
	this.startPlaying = function (sendData) {
		this.currentPlayer = this.gameStarter;
		var memberObj = this.members[this.playerArr[this.currentPlayer]];
		this.sendTrumpInfo(sendData, 2);
		this.biddingOver = true;
		if (memberObj.human === false) {
			var bestCard = trumpEngine.bestCard(memberObj, this.currentRound, this.trump.card);
			var cardData = {play:true, player:this.currentPlayer, cardObj:{card:bestCard.card, index:bestCard.index, player:memberObj.position}};
			sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:sleepSeconds});
			this.nextPlayer(cardData, sendData, false);
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

	this.nextPlayer = function (data, sendData, human) {
		if (human) {
			var validObj = trumpEngine.isValidCard(this.members[this.playerArr[this.currentPlayer]], data.cardObj.card, this.currentRound, this.trump);
			if (validObj[0] === false) {
				data.cardObj = null;
				sendData.push({dest:SENDER, event:events.play, message:validObj[1],  data:data});
				return sendData;
			}
		}
		this.currentPlayer++;
		this.currentPlayer %= this.totalPlayers;
		this.currentRound.push(data.cardObj);
		var userObj = this.members[this.playerArr[data.cardObj.player]];
		userObj.hand.splice(data.cardObj.index, 1);
		if (this.currentRound.length == this.totalPlayers) {
			var roundWinner = trumpEngine.processRound(this.currentRound, null);
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
		if (this.members[this.playerArr[this.currentPlayer]].human === false) {
			sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:sleepSeconds});
			var newData = JSON.parse(JSON.stringify(data));
			var bestCard = trumpEngine.bestCard(this.members[this.playerArr[this.currentPlayer]], this.currentRound, this.trump.card);
			newData.cardObj.card = bestCard.card;
			newData.cardObj.index = bestCard.index;
			newData.cardObj.player = this.currentPlayer;
			this.nextPlayer(newData, sendData, false);
		}
		return sendData;
	};
	this.computerBid = function (playerObj, data, sendData) {
		sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:sleepSeconds});
		var bestBid = trumpEngine.bestBid(playerObj, data.bidObj, this.trump.card);
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
			var trumpcard = trumpEngine.setTrump(playerObj, this.trump);
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
				data.bidObj.points = trumpEngine.getMinimumBid(this.totalPoints, 1);
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
					trumpData.trump = trumpEngine.setTrump(this.members[this.playerArr[trumpData.bidObj.bidder]], this.trump);
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
					trumpData.trump = trumpEngine.setTrump(this.members[this.playerArr[trumpData.bidObj.bidder]], this.trump);
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
exports.createGame = function(game, session, room) {
	var testPlayers = 4;
	var numplayers = (session < 6) ? 4 : 6;
	return new table(4, room);
	//return new table(numplayers, room);
};
