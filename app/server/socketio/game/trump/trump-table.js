var events = require('../events').events;
var ALL = 2, ALL_BUT_SENDER = 1, SENDER = 0;

var cardClass = require('../card-class');
var tableClass = require('../table-class');
var sleepSeconds = 0.1 * 200000;

trump.prototype = new tableClass.obj();
trump.prototype.constructor = trump;
function trump (num, room) {
	this.gameEngine = require('./trump-engine');
	this.autoPrePlay = true;
	this.autoGamePlay = true;
	this.autoGameCount = 5;
	this.gameCount = 0;
	this.room = room;
	this.totalPoints = this.gameEngine.getTotalPoints(num);
	this.cardDeck = this.gameEngine.pruneCardDeck(cardClass.createCardDeck(), num);
	this.totalPlayers = num;
	this.handCount = parseInt(this.cardDeck.length/this.totalPlayers, 10);
	this.trump = {card:null, setter:-1, points:0, revealed:false, revealer:-1, revealRound:-1, revealPosition:-1};
	this.games = [];
	this.inProgress = false;
	this.members = {};
	this.playerArr = [];
	this.gameStarter = 0;
	this.currentRound = null;
	this.round = null;
	this.bidData = null;
	this.bidCount = 0;
	this.minimumBid = 0;
	this.currentBid = 0;
	this.firstBid = 0;
	this.prePlayOver = false;
	this.currentPlayer = 0;

	//TRUMP SPECIFIC VARIABLES & FUNCTIONS
	this.resetTrump = function () {
		this.trump.card =null;
		this.trump.setter = -1;
		this.trump.points = 0;
		this.trump.revealed = false;
		this.trump.revealer = -1;
		this.trump.revealRound = -1;
		this.trump.revealPosition = -1;
	};

	this.initValues = function () {
		this.resetTrump();
		this.currentRound = [];
		this.round = [];
		this.bidData = [];
		this.bidCount = 0;
		this.minimumBid = this.gameEngine.getMinimumBid(this.totalPoints, 0);
		this.currentBid = this.minimumBid;
		this.firstBid = this.minimumBid;
		this.prePlayOver = false;
		this.currentPlayer = this.gameStarter;
		this.currentBidder = this.gameStarter;
	};

	this.setPlayerCards = function (playerObj, start, end) {
		playerObj.hand = [];
		for (var i = start; i < end; i++) {
			playerObj.hand.push(this.cardDeck[i]);
		}
	};

	this.setNewGame = function (sendData) {
		this.initValues();
		cardClass.shuffle(this.cardDeck);
		var i = 1, j = 0;
		for (var key in this.members) {
			j = i-1;
			var userObj = this.members[key];
			userObj.points = 0;
			this.setPlayerCards(userObj, j, j+this.handCount);
			i+= this.handCount;
			if (userObj.human === true) {
				sendData.push({dest:SENDER, receiver:userObj.name, event:events.cards, message:"Cards",  data:{set:1, cards:userObj.getCardSet(1)}});
				//Testing
				if (this.autoPrePlay === true || this.gameEngine.site == "Spades")
					sendData.push({dest:SENDER, receiver:userObj.name, event:events.cards, message:"Cards",  data:{set:2, cards:userObj.getCardSet(2)}});
			}
		}
	};
	this.getGameStats = function () {
		var statsObj = {
			'points':this.trump.points,
			'team':this.trump.setter % 2,
			'setter':this.trump.setter,
			'team_points': 0,
			'win':false,
			'rem_points':0,
			'best_player':-1,
			'best_points':-1,
			'team_info':[
				{'index':0, 'players':[]},
				{'index':1, 'players':[]}
			],
			'trump_revealer':this.trump.revealer,
			'trump_reveal_round':this.trump.revealRound + 1,
			'trump_card':this.trump.card
		};
		var userObj = null;
		var key = null;
		for (key in this.members) {
			userObj = this.members[key];
			if (userObj.points > statsObj.best_points) {
				statsObj.best_points = userObj.points;
				statsObj.best_player = userObj.position;
			}
			if (userObj.team === this.trump.setter % 2) {
				statsObj.team_points += userObj.points;
			}
		}
		statsObj.rem_points = this.totalPoints - statsObj.team_points;
		if (statsObj.team_points >= this.trump.points) {
			statsObj.win = true;
		}
		for (var i = 0 ; i < this.playerArr.length; i++) {
			userObj = this.members[this.playerArr[i]];
			if (userObj.team === statsObj.team) {
				if (statsObj.win === true) {
					userObj.wins += 1;
				}
			} else {
				if (statsObj.win === false) {
					userObj.wins += 1;
				}
			}
			statsObj.team_info[userObj.team].players.push({'position': userObj.position, 'points':userObj.points});
		}
		this.checkGameSanity();
		//console.log("stats:"+JSON.stringify(statsObj));
		return statsObj;
	};

	this.checkGameSanity = function() {
		var index_map = [];
		var i = 0;
		var sane = true;
		for (i = 0 ; i < 52; i++) {
			index_map.push(0);
		}
		for (i = 0 ; i < this.round.length; i++) {
			var roundObj = this.round[i];
			if (roundObj.round.length != this.playerArr.length) {
				console.log("Round "+i+" has only "+roundObj.round.length+" cards and not "+this.playerArr.length+" cards");
				sane = false;
			}
			for (var j = 0; j < roundObj.round.length; j++) {
				index_map[roundObj.round[j].card.index] += 1;
			}
		}
		for (i = 0 ; i < this.cardDeck.length; i++) {
			if (index_map[this.cardDeck[i].index] === 0 ) {
				console.log("Card "+this.cardDeck[i].name+" did not appear at all");
				sane = false;
			} else if (index_map[this.cardDeck[i].index] > 1 ) {
				console.log("Card "+this.cardDeck[i].name+" appeared twice");
				sane = false;
			}
		}
		if (sane === true) {
			console.log("Game is Sane");
		}
		return;
	};

	this.updatePoints = function (winner, points) {
		userObj = this.members[this.playerArr[winner]];
		userObj.points += points;
	};

	this.sendPreGameInfo = function (sendData, round) {
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

	this.startPlay = function (sendData) {
		this.currentPlayer = this.gameStarter;
		var playerObj = this.members[this.playerArr[this.currentPlayer]];
		this.prePlayOver = true;
		this.sendPreGameInfo(sendData, 2);
		if (playerObj.human === false) {
			var cardData = {play:true, player:this.currentPlayer, cardObj:{}};
			this.computerPlay(playerObj, cardData, sendData);
		}else {
			var validCards = this.gameEngine.getValidCards(playerObj, this.currentRound, this.round.length, this.trump);
			sendData.push({dest:ALL, event:events.play, message:"PLAY",
				data:{play:true, player:this.currentPlayer, cardObj:null, validCards:validCards}
			});
		}
	};

	this.isValid = function (data, sendData) {
		var validObj;
		var playerObj = this.members[this.playerArr[this.currentPlayer]];
		var retval = false;
		if (data.reveal === true) {
			validObj = this.gameEngine.revealTrump(playerObj, this.currentRound, this.trump);
			if (validObj[0] === true) {
				data.card = this.trump.card;
				this.trump.revealed = true;
				this.trump.revealer = this.currentPlayer;
				this.trump.revealRound = this.round.length;
				this.trump.revealPosition = this.currentRound.length;
				data.validCards = this.gameEngine.getValidCards(playerObj, this.currentRound, this.round.length, this.trump);
				sendData.push({dest:ALL, event:events.play, message:validObj[1],  data:data});
			} else {
				data.card = null;
				sendData.push({dest:SENDER, event:events.play, message:validObj[1],  data:data});
			}
		} else {
			validObj = this.gameEngine.isValidCard(playerObj, data.cardObj, this.currentRound, this.round.length, this.trump);
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
		if (human) {
			if (this.gameCount < this.autoGameCount) {
				this.autoGamePlay = true;
			}
		}
		this.currentPlayer++;
		this.currentPlayer %= this.totalPlayers;
		this.currentRound.push(data.cardObj);
		var prevPlayerObj = this.members[this.playerArr[data.cardObj.player]];
		prevPlayerObj.hand.splice(data.cardObj.index, 1);
		if (this.currentRound.length == this.totalPlayers) {
			var roundWinner = this.gameEngine.processRound(this.currentRound, this.round.length, this.trump);
			sendData.push({dest:ALL, event:events.play, message:"PLAY",  data:{play:true, player:-1, cardObj:data.cardObj}});
			sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:sleepSeconds});
			sendData.push({dest:ALL, event:events.round, message:"Round",  data:{prevRound:this.currentRound, winner:roundWinner}});
			this.updatePoints(roundWinner.player, roundWinner.points);
			this.round.push({winner:roundWinner.player, points:roundWinner.points, round:this.currentRound});
			this.currentRound = [];
			if (this.round.length === this.handCount) {
				sendData.push({dest:ALL, event:events.game, message:"Game",  data:{prevGame:{allRounds:this.round, stats:this.getGameStats()}}});
				this.round = [];
				this.gameStarter++;
				this.gameStarter %= this.totalPlayers;
				this.gameCount++;
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
		this.nextPlay(data, sendData, false);
	};
	this.computerPrePlay = function (playerObj, data, sendData) {
		sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:sleepSeconds});
		var bestBid = this.gameEngine.bestBid(playerObj, data.bidObj, this.trump);
		data.bidObj.minimum = false;
		if (bestBid.pass && bestBid.pass === true) {
			data.pass = bestBid.pass;
		} else {
			data.bidObj.points = bestBid.points;
			data.bidObj.bidder = this.currentPlayer;
		}
		this.nextPrePlay(data, sendData);
	};

	this.startPrePlay = function (sendData) {
		this.setNewGame(sendData);
		var bidObj = {minimum:true, bid:true, bidder:this.currentPlayer, points:this.minimumBid };
		var data = {player:this.currentPlayer, trump:null, play:false, bidObj:bidObj};
		var playerObj = this.members[this.playerArr[this.currentPlayer]];

		if (this.autoPrePlay === false) {
			if (playerObj.human === false) {
				this.computerPrePlay(playerObj, data, sendData);
			} else {
				sendData.push({dest:ALL, event:events.play, message:"PLAY", data:data});
			}
		} else {
			var trumpcard = this.gameEngine.setTrump(playerObj, this.trump);
			this.trump.card = trumpcard;
			this.trump.setter = this.currentPlayer;
			this.trump.points = this.minimumBid;
			this.startPlay(sendData);
		}
	};

	this.nextPrePlay = function (data, sendData) {
		var trumpData, bestBid;
		var playerObj;
		if (data.trump !== null) {
			this.firstBid = this.currentBid;
			this.bidData = [];
			if (this.trump.card !== null) {
				this.trump.card = data.trump;
				this.trump.setter = data.bidObj.bidder;
				this.trump.points = data.bidObj.points;
				this.startPlay(sendData);
				return sendData;
			} else  {
				this.trump.card = data.trump;
				this.trump.setter = data.bidObj.bidder;
				this.trump.points = data.bidObj.points;
				this.sendPreGameInfo(sendData, 1);
				for (var key in this.members) {
					var userObj = this.members[key];
					if (userObj.human)
						sendData.push({dest:SENDER, receiver:userObj.name, event:events.cards, message:"Cards",  data:{set:2, cards:userObj.getCardSet(2)}});
				}
				this.currentPlayer = this.gameStarter;
				data.bidObj.bid = true;
				data.bidObj.points = this.gameEngine.getMinimumBid(this.totalPoints, 1);
				data.bidObj.bidder = this.currentPlayer;
				data.trump = null;
				data.player = this.currentPlayer;
				playerObj = this.members[this.playerArr[data.player]];
				if (playerObj.human === false) {
					var secondData = JSON.parse(JSON.stringify(data));
					this.computerPrePlay(playerObj, data, sendData);
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
					trumpData.trump = this.gameEngine.setTrump(this.members[this.playerArr[trumpData.bidObj.bidder]], this.trump);
					this.nextPrePlay(trumpData, sendData);
				} else {
					data.bidObj.bid = false;
					data.player = data.bidObj.bidder;
					sendData.push({dest:ALL, event:events.play, message:"PLAY",  data:data});
				}
			} else if (this.bidCount == 2 * this.totalPlayers) {
				this.bidCount = 0;
				if (this.firstBid == this.currentBid) {
					this.startPlay(sendData);
					return sendData;
				}
				if (this.members[this.playerArr[data.bidObj.bidder]].human === false) {
					trumpData = JSON.parse(JSON.stringify(data));
					trumpData.trump = this.gameEngine.setTrump(this.members[this.playerArr[trumpData.bidObj.bidder]], this.trump);
					this.nextPrePlay(trumpData, sendData);
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
					this.computerPrePlay(playerObj, newData, sendData);
				} else {
					data.player = this.currentPlayer;
					sendData.push({dest:ALL, event:events.play, message:"PLAY",  data:data});
				}
			}
		}
		return sendData;
	};
	this.sendCurrentState = function (playerObj, sendData) {
		if (this.prePlayOver === true) {
			sendData.push({dest:SENDER, event:events.ready, message:"READY", data:{inProgress:true, players:this.playerArr, round:this.currentRound, trumpData:{setter:this.trump.setter, points:this.trump.points, revealed:this.trump.revealed, card:(this.trump.revealed === true)?this.trump.card:null }}});
			sendData.push({dest:SENDER, event:events.cards, message:"CARDS",  data:{set:1, cards:playerObj.getCardSet(1)}});
			sendData.push({dest:SENDER, event:events.cards, message:"CARDS",  data:{set:2, cards:playerObj.getCardSet(2)}});
		} else {
			sendData.push( {dest:SENDER, event:events.ready, message:"READY",
				data:{inProgress:true, players:this.playerArr, bidData:this.bidData, trumpData:{setter:this.trump.setter, points:this.trump.points}}
			});
			sendData.push({dest:SENDER, event:events.cards, message:"CARDS",  data:{set:1, cards:playerObj.getCardSet(1)}});
			if (this.trump.card !== null) {
				sendData.push({dest:SENDER, event:events.cards, message:"CARDS",  data:{set:2, cards:playerObj.getCardSet(2)}});
			}
		}
	};
	this.resumeOnPlayerLeave = function (playerObj, sendData) {
		if (this.prePlayOver === true) {
			var cardData = {play:true, player:this.currentPlayer, cardObj:{}};
			this.computerPlay(playerObj, cardData, sendData);
		} else {
			var bidObj = {bid:true, bidder:this.currentBidder, points:this.currentBid };
			var bidData = {player:this.currentPlayer, trump:null, play:false, bidObj:bidObj};
			this.computerPrePlay(playerObj, bidData, sendData);
		}
	};
}
exports.createGame = function(data) {
	if (data.site == "trump")
		return new trump(data.total, data.room);
	else if (data.site == "spades")
		return new spades(data.total, data.room);
};

function spades(num, room){
	this.gameEngine = require('./spade-engine');
	this.cardDeck = this.gameEngine.pruneCardDeck(cardClass.createCardDeck(), num);
	var aceOfSpades = this.cardDeck[0];
	this.trump = {card:aceOfSpades, setter:-1, revealed:false, revealer:-1, revealRound:-1, revealPosition:-1};
	this.autoPrePlay = false;
	this.room = room;
	this.totalPoints = this.gameEngine.getTotalPoints(num);
	this.totalPlayers = num;
	this.handCount = parseInt(this.cardDeck.length/this.totalPlayers, 10);
	this.games = [];
	this.inProgress = false;
	this.members = {};
	this.playerArr = [];
	this.gameStarter = 0;
	this.currentRound = null;
	this.round = null;
	this.bidData = null;
	this.bidCount = 0;
	this.minimumBid = 0;
	this.currentBid = 0;
	this.firstBid = 0;
	this.prePlayOver = false;
	this.currentPlayer = 0;

	this.startPrePlay = function (sendData) {
		this.setNewGame(sendData);
		var bidObj = {bid:true, bidder:this.currentPlayer, points:this.minimumBid};
		var data = {player:this.currentPlayer, play:false, bidObj:bidObj};
		var playerObj = this.members[this.playerArr[this.currentPlayer]];

		if (this.autoPrePlay === false) {
			if (playerObj.human === false) {
				this.computerPrePlay(playerObj, data, sendData);
			} else {
				sendData.push({dest:ALL, event:events.play, message:"PLAY", data:data});
			}
		} else {
			this.startPlay(sendData);
		}
	};

	this.sendPreGameInfo = function (sendData, round) {
		sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:sleepSeconds});
		sendData.push({dest:ALL, event:events.play, message:"PLAY",
			data:{play:false, player:-1, bidObj:{bid:false, bidder:this.trump.setter, points:this.trump.points, trump:true, round:2, index:-1}}
		});
	};

	this.resetTrump = function () {
		this.trump.revealed = false;
	};

	this.nextPrePlay = function (data, sendData) {
		var playerObj;
		if (data.pass !== true) {
			this.bidData.push([this.currentPlayer, data.bidObj.points]);
		} else {
			this.bidData.push([this.currentPlayer, 0]);
		}
		delete data.pass;
		this.bidCount++;
		this.currentPlayer++;
		this.currentPlayer %= this.totalPlayers;
		if (this.bidCount == this.totalPlayers) {
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
}
spades.prototype = new trump();
spades.prototype.constructor = spades;
