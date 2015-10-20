var events = require('./events').events;
var ALL = 2, ALL_BUT_SENDER = 1, SENDER = 0;
var PASSLEFT = 0, PASSACROSS = 1, PASSRIGHT = 2, NOPASS = 3;

var cardClass = require('./card-class');
var tableClass = require('./table-class');
var sleepSeconds = 0.5 * 200000;

var Engine = require('./engine/trump-engine');
hearts.prototype = new tableClass.obj();
hearts.prototype.constructor = hearts;

function hearts (num, room) {
	this.game = 'hearts';
	this.autoPass = false;
	this.room = room;
	this.fullCardDeck = cardClass.createCardDeck();
	this.totalPlayers = num;
	this.allGames = [];
	this.inProgress = false;
	this.members = {};
	this.playerArr = [];
	this.gameStarter = 0;
	this.autoGamePlay = true;
	this.autoGameCount = 15;
	this.cardDeck = null;
	this.aceOfHearts = this.fullCardDeck[13];
	this.trump = null;

	this.initValues = function () {
		this.gameEngine = Engine.createNewGame(this.game, this.totalPlayers);
		this.cardDeck = this.gameEngine.pruneCardDeck(this.fullCardDeck);
		this.handCount = parseInt(this.cardDeck.length/this.totalPlayers, 10);
		this.currentRound = [];
		this.trump = {
			card:this.aceOfHearts,
			setter:-1,
			points:0,
			revealed:false,
			revealer:-1,
			revealRound:-1,
			revealPosition:-1
		};
		this.round = [];
		this.passData = [];
		this.passCount = 0;
		this.prePlayOver = false;
		this.currentPlayer = this.gameStarter;
	};

	this.setPlayerCards = function (playerObj, start, end) {
		playerObj.hand = [];
		for (var i = start; i < end; i++) {
			playerObj.hand.push(this.cardDeck[i]);
		}
		this.gameEngine.sortPlayerHand(playerObj.hand);
	};

	this.setNewGame = function (sendData) {
		this.initValues();
		cardClass.shuffle(this.cardDeck);
		var i = 1, j = 0;
		for (var key in this.members) {
			j = i-1;
			var userObj = this.members[key];
			this.setPlayerCards(userObj, j, j+this.handCount);
			i+= this.handCount;
			if (userObj.human === true) {
				sendData.push({dest:SENDER, receiver:userObj.name, event:events.cards, message:"Cards",  data:{set:1, cards:userObj.hand}});
			}
		}
	};

	this.startPlay = function (sendData) {
		this.prePlayOver = true;
		this.sendPreGameInfo(sendData, 2);
		for (var key in this.members) {
			var userObj = this.members[key];
			for (var i = 0; i < userObj.hand.length; i++) {
				if (userObj.hand[i].name == "2C") {
					console.log("2C is with " + userObj.position);
					this.gameStarter = userObj.position;
				}
			}
		}
		this.currentPlayer = this.gameStarter;
		var playerObj = this.members[this.playerArr[this.currentPlayer]];
		if (playerObj.human === false) {
			var cardData = {play:true, player:this.currentPlayer, cardObj:{}};
			this.computerPlay(playerObj, cardData, sendData);
		} else {
			var validCards = this.gameEngine.getValidCards(this.members[this.playerArr[this.currentPlayer]], this.currentRound, this.round.length, this.trump);
			sendData.push({dest:ALL, event:events.play, message:"PLAY",
				 data:{play:true, player:this.currentPlayer, cardObj:null, validCards:validCards}
			});
		}
	};

	this.updatePoints = function (winner, points) {
		userObj = this.members[this.playerArr[winner]];
		userObj.points += points;
	};

	this.getPassedCards = function (playerObj) {
		var arr = [];
		for (var i = 0; i < playerObj.passCards.length; i++) {
			arr.push(playerObj.hand[playerObj.passCards[i]]);
		}
		return arr;
	};

	this.changePlayerHands = function() {
		for (var i = 0; i < this.playerArr.length; i++) {
			var playerObj = this.members[this.playerArr[i]];
			for (var j = 0; j < playerObj.passCards.length; j++) {
				playerObj.hand[playerObj.passCards[j]] = this.passCards[i][j];
			}
		}
	};

	this.sendPreGameInfo = function (sendData, round) {
		this.prePlayOver = true;
		var game = this.allGames.length%this.totalPlayers;
		var offset = this.totalPlayers;
		if (game === PASSLEFT) {
			offset = offset - 1;
		} else if (game === PASSACROSS) {
			offset = offset - 2;
		} else if (game === PASSRIGHT) {
			offset = offset - 3;
		} else {
			sendData.push({dest:ALL, event:events.play, message:"PLAY", data:{play:false, player:-1, passOver:true}});
			return;
		}
		this.passCards = [];
		for (var i = 0; i < this.playerArr.length; i++) {
			var userObj = this.members[this.playerArr[i]];
			var passedPlayer = (userObj.position+offset)%this.totalPlayers;
			var cards = this.getPassedCards(this.members[this.playerArr[passedPlayer]]);
			this.passCards.push(cards);
			if (userObj.human === true) {
				sendData.push({dest:SENDER, receiver:userObj.name, event:events.play, message:"PLAY", data:{play:false, player:userObj.position, passOver:true, cards:cards}});
			}
		}
		this.changePlayerHands();
	};

	this.isValid = function (data, sendData) {
		var validObj;
		var playerObj = this.members[this.playerArr[this.currentPlayer]];
		var retval = false;
		if (data.reveal === true) {
			validObj = this.gameEngine.revealTrump(playerObj, this.currentRound, this.trump);
			if (validObj[0] === true) {
				sendData.push({dest:ALL, event:events.play, message:validObj[1],  data:data});
			} else {
				data.card = null;
				sendData.push({dest:SENDER, event:events.play, message:validObj[1],  data:data});
			}
		} else {
			validObj = this.gameEngine.isValidCard(playerObj, data.cardObj.card, this.currentRound, this.round.length, null);
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

	this.nextPlay = function (data, sendData, human) {
		var playerObj;
		if (human && !this.isValid(data, sendData)) {
			return sendData;
		}
		this.currentPlayer++;
		this.currentPlayer %= this.totalPlayers;
		this.currentRound.push(data.cardObj);
		var userObj = this.members[this.playerArr[data.cardObj.player]];
		userObj.hand.splice(data.cardObj.index, 1);
		if (this.currentRound.length == this.totalPlayers) {
			var roundWinner = this.gameEngine.processRound(this.currentRound, null);
			sendData.push({dest:ALL, event:events.play, message:"PLAY",  data:{play:true, player:-1, cardObj:data.cardObj}});
			sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:sleepSeconds});
			sendData.push({dest:ALL, event:events.round, message:"Round",  data:{prevRound:this.currentRound, winner:roundWinner}});
			this.updatePoints(roundWinner.player, roundWinner.points);
			this.round.push({winner:roundWinner.player, points:roundWinner.points, round:this.currentRound});
			this.currentRound = [];
			if (this.round.length === this.handCount) {
				sendData.push({dest:ALL, event:events.game, message:"Game",  data:{prevGame:{allRounds:this.round, stats:null}}});
				//this.games.push(this.round);
				this.allGames.push(this.round);
				this.gameEngine.checkGameSanity(this.cardDeck, this.round);
				this.round = [];
				this.autoGamePlay = false;
				this.startPrePlay(sendData);
			} else {
				this.currentPlayer = roundWinner.player;
				var validCards = this.gameEngine.getValidCards(this.members[this.playerArr[this.currentPlayer]], this.currentRound, this.round.length, this.trump);
				sendData.push({dest:ALL, event:events.play, message:"PLAY",  data:{play:true, player:this.currentPlayer, cardObj:null, validCards:validCards}});
			}
		} else {
			data.player = this.currentPlayer;
			data.validCards = this.gameEngine.getValidCards(this.members[this.playerArr[this.currentPlayer]], this.currentRound, this.round.length, this.trump);
			sendData.push({dest:ALL, event:events.play, message:"PLAY",  data:data});
		}
		playerObj = this.members[this.playerArr[this.currentPlayer]];
		if (this.autoGamePlay === true || playerObj.human === false) {
			var newData = JSON.parse(JSON.stringify(data));
			this.computerPlay(playerObj, newData, sendData);
		}
		return sendData;
	};
	this.computerPlay = function (playerObj, data, sendData) {
		sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:sleepSeconds});
		var bestCard = this.gameEngine.bestCard(playerObj, this.currentRound, this.trump);
		data.cardObj.card = bestCard.card;
		data.cardObj.index = bestCard.index;
		data.cardObj.player = this.currentPlayer;
		this.nextPlay(data, sendData, false);
	};
	this.computerPrePlay = function (playerObj, data, sendData) {
		sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:sleepSeconds});
		var passCards = this.gameEngine.getPassCards(playerObj);
		data.passCards = passCards;
		this.nextPrePlay(data, sendData);
	};

	this.startPrePlay = function (sendData) {
		this.setNewGame(sendData);
		var data = {player:this.currentPlayer, play:false, game:(this.allGames.length%this.totalPlayers)};
		var playerObj = this.members[this.playerArr[this.currentPlayer]];

		if (this.autoPass === false && this.allGames.length%this.totalPlayers !== NOPASS) {
			if (playerObj.human === false) {
				this.computerPrePlay(playerObj, data, sendData);
			} else {
				sendData.push({dest:ALL, event:events.play, message:"PLAY", data:data});
			}
		} else {
			this.startPlay(sendData);
		}
	};

	this.nextPrePlay = function (data, sendData) {
		var playerObj = this.members[this.playerArr[data.player]];
		playerObj.passCards = data.passCards;
		this.passCount++;
		this.currentPlayer++;
		this.currentPlayer %= this.totalPlayers;
		delete data.passCards;
		delete data.game;
		if (this.passCount == this.totalPlayers) {
			this.startPlay(sendData);
		} else {
			playerObj = this.members[this.playerArr[this.currentPlayer]];
			if (playerObj.human === false) {
				var newData = JSON.parse(JSON.stringify(data));
				newData.player = this.currentPlayer;
				this.computerPrePlay(playerObj, newData, sendData);
			} else {
				data.player = this.currentPlayer;
				sendData.push({dest:ALL, event:events.play, message:"PLAY",  data:data});
			}
		}
		return sendData;
	};

	this.sendCurrentState = function (playerObj, sendData) {
		var data = {player:this.currentPlayer, play:false, game:(this.allGames.length%this.totalPlayers)};
		sendData.push({dest:SENDER, event:events.ready, message:"READY", data:{inProgress:true, players:this.playerArr, round:this.currentRound}});
		sendData.push({dest:SENDER, event:events.cards, message:"CARDS",  data:{set:1, cards:playerObj.hand}});
		if (this.prePlayOver === true) {
			sendData.push({dest:SENDER, event:events.play, message:"PLAY", data:{play:false, player:this.currentPlayer, passOver:this.prePlayOver, cards:null}});
		} else {
			sendData.push({dest:SENDER, event:events.play, message:"PLAY", data:data});
		}
	};

	this.resumeOnPlayerLeave = function (playerObj, sendData) {
		if (this.prePlayOver === true) {
			var cardData = {play:true, player:this.currentPlayer, cardObj:{}};
			this.computerPlay(playerObj, cardData, sendData);
		} else {
			var data = {player:this.currentPlayer, play:false};
			this.computerPrePlay(playerObj, data, sendData);
		}
	};
}

exports.createGame = function(data) {
	return new hearts(data.total, data.room);
};
