var events = require('./events').events;
var ALL = 2, ALL_BUT_SENDER = 1, SENDER = 0;
var PASSLEFT = 0, PASSACROSS = 1, PASSRIGHT = 2, NOPASS = 3;
var cardClass = require('./card-class');
var tableClass = require('./table-class');
var SLEEP_SECONDS = 0.3 * 200000;
var PLAYER_TIMEOUT = 4000;
var COMPUTER_TIMEOUT = 4000;
var gameEngine = require('./engine/basic-engine');
var assert = require('assert');

exports.createGame = function(data) {
	if (data.site == "trump") {
		return new trump_table(data.total, data.room, data.site);
	} else if (data.site == "spades") {
		return new spades_table(data.total, data.room, data.site);
	} else if (data.site == "ass") {
		return new ass_table(data.total, data.room, data.site);
	} else {
		return new hearts_table(data.total, data.room, data.site);
	}
};

function trump_table (num, room, game) {
	this.game = game;
	this.room = room;
	this.totalPlayers = num;
	this.members = {};
	this.playerArr = [];
	this.inProgress = false;
	this.currentPlayer = 0;
	this.gameStarter = 0;
	this.cutToChase = true;
	this.testGamePlay = true;
	this.testGamePlayCount = 0;
	this.prePlayCount = 0;
	this.minimumBid = 0;
	this.currentBid = 0;
	this.firstBid = 0;
	this.prePlayOver = false;
	this.fullCardDeck = cardClass.createCardDeck();
	this.gameEngine = null;
	this.trump = null;
	this.currentRound = null;
	this.round = null;
	this.bidData = null;
	this.cardDeck = null;
	this.handCount = null;
	this.constantTrump = null;
	this.allGames = [];

	this.setPlayerCards = function (playerObj, start, end) {
		playerObj.hand = [];
		for (var i = start; i < end; i++) {
			playerObj.hand.push(this.cardDeck[i]);
		}
		if (this.constantTrump !== null) {
			this.gameEngine.sortPlayerHand(playerObj.hand);
		}
	};

	this.sendPlayerCards = function (sendData, set) {
		set = set || 0;
		for (var key in this.members) {
			var userObj = this.members[key];
			if (userObj.human === true) {
				sendData.push({dest:SENDER, receiver:userObj.name, event:events.cards, message:"Cards",  data:{set:1, cards:userObj.getCardSet(set)}});
			}
		}
	};

	this.setNewGame = function () {
		this.gameEngine = gameEngine.createNewGame(this.game, this.totalPlayers);
		this.trump = {
			card:null,
			setter:-1,
			points:0,
			revealed:false,
			revealer:-1,
			revealRound:-1,
			revealPosition:-1
		};
		if (this.cardDeck === null) {
			this.cardDeck = this.gameEngine.pruneCardDeck(this.fullCardDeck);
			this.handCount = parseInt(this.cardDeck.length/this.totalPlayers, 10);
		}
		if (this.constantTrump !== null) {
			this.trump.card = this.constantTrump;
		}
		cardClass.shuffle(this.cardDeck);
		this.currentRound = [];
		this.round = [];
		this.bidData = [];
		this.prePlayCount = 0;
		this.minimumBid = this.gameEngine.getMinimumBid(0);
		this.currentBid = this.minimumBid;
		this.firstBid = this.minimumBid;
		this.prePlayOver = false;
		this.currentPlayer = this.gameStarter;
		this.currentBidder = this.gameStarter;
		if (this.testGamePlayCount === 0) {
			this.testGamePlay = false;
		}
		var i = 1, j = 0;
		for (var key in this.members) {
			j = i-1;
			var userObj = this.members[key];
			userObj.points = 0;
			userObj.bid = 0;
			this.setPlayerCards(userObj, j, j+this.handCount);
			i+= this.handCount;
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
		statsObj.rem_points = this.gameEngine.getTotalPoints() - statsObj.team_points;

		if (statsObj.team_points >= this.trump.points) {
			statsObj.win = true;
		}
		for (var i = 0 ; i < this.playerArr.length; i++) {
			userObj = this.members[this.playerArr[i]];
			userObj.total_games += 1;
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
		this.gameEngine.checkGameSanity(this.cardDeck, this.round);
		//console.log("stats:"+JSON.stringify(statsObj));
		return statsObj;
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
		sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:SLEEP_SECONDS});
		sendData.push({dest:ALL, event:events.play, message:"PLAY",
			data:{play:false, player:-1,
				bidObj:{bid:false, bidder:this.trump.setter, points:this.trump.points, trump:true, round:round, index:index}
			}
		});
	};

	this.setNextPlayerTurn = function(playData, sendData, message) {
		var target_func = null;
		var nextData = JSON.parse(JSON.stringify(playData));
		//console.log("NextPlayer is "+nextData.player);
		var playerObj = this.members[this.playerArr[nextData.player]];
		message = message || "PLAY";
		if (this.prePlayOver === true) {
			nextData.validCards = this.gameEngine.getValidCards(playerObj, this.currentRound, this.round.length, this.trump);
			target_func = this.computerPlay.bind(this);
		} else {
			target_func = this.computerPrePlay.bind(this);
		}
		sendData.push({dest:ALL, event:events.play, message:message,  data:nextData});
		if (this.testGamePlay === true) {
			target_func(playerObj, nextData, sendData);
		} else if (this.testGamePlayCount > 0) {
		   if (playerObj.human === false) {
			   target_func(playerObj, nextData, sendData);
		   } else {
			   //Wait for event from User
			   //Testing mode ..... At the end of a game
		   }
		} else {
			var timeOut = (playerObj.human) ? PLAYER_TIMEOUT : COMPUTER_TIMEOUT;
			var callback = function (timerData, sendData) {
				var playerObj = this.members[this.playerArr[timerData.player]];
				if (playerObj) {
					//console.log("Calling PrePlay with data:"+JSON.stringify(timerData.data));
					target_func(playerObj, timerData.data, sendData);
				} else {
					console.log("Player object is null");
					console.log(JSON.stringify(timerData.data));
				}
			}.bind(this);
			//SETTING TIME OUT EVENT FOR COMPUTER PLAY instead of Recursion
			var timerData = {timeOut:timeOut, data:nextData, player:nextData.player, callback:callback};
			//console.log("Setting timer with option "+this.prePlayOver+" with data:"+JSON.stringify(timerData.data));
			sendData.push({dest:ALL, event:events.timer, message:"TIMER",  internalData:timerData, outData:{timeOut:timeOut, player:nextData.player}});
		}
	};

	this.startPlay = function (sendData) {
		this.prePlayOver = true;
		this.testGamePlay = false;
		this.sendPreGameInfo(sendData, 2);
		this.currentPlayer = this.gameStarter;
		var cardData = {play:true, player:this.currentPlayer, cardObj:{}};
		this.setNextPlayerTurn(cardData, sendData);
	};

	this.isValid = function (data, sendData) {
		var validObj;
		var playerObj = this.members[this.playerArr[this.currentPlayer]];
		var retval = false;
		var message = 'success';
		if (data.reveal === true) {
			validObj = this.gameEngine.revealTrump(playerObj, this.currentRound, this.trump);
			if (validObj[0] === true) {
				data.card = this.trump.card;
				this.trump.revealed = true;
				this.trump.revealer = this.currentPlayer;
				this.trump.revealRound = this.round.length;
				this.trump.revealPosition = this.currentRound.length;
				data.validCards = this.gameEngine.getValidCards(playerObj, this.currentRound, this.round.length, this.trump);
				//sendData.push({dest:ALL, event:events.play, message:validObj[1],  data:data});
			} else {
				data.card = null;
				delete data.card;
				//sendData.push({dest:SENDER, event:events.play, message:validObj[1],  data:data});
			}
			message = validObj[1];
		} else {
			//console.log(JSON.stringify(data.cardObj));
			validObj = this.gameEngine.isValidCard(playerObj, data.cardObj, this.currentRound, this.round.length, this.trump);
			if (validObj[0] === false) {
				message = validObj[1];
				//sendData.push({dest:SENDER, event:events.play, message:validObj[1],  data:data});
				retval = false;
			} else {
				retval = true;
			}
		}
		return [retval, message];
	};

	this.processNextPlay = function (data, sendData, human) {
		var playerObj;
		if (human) {
			var retObj = this.isValid(data, sendData);
			if (retObj[0] === false) {
				data.cardObj = {};
				//data.player = this.currentPlayer;
				this.setNextPlayerTurn(data, sendData, retObj[1]);
				return sendData;
			}
			if (this.allGames.length < this.testGamePlayCount) {
				this.testGamePlay = true;
			}
		}
		this.currentPlayer++;
		this.currentPlayer %= this.totalPlayers;
		this.currentRound.push(data.cardObj);
		//console.log(JSON.stringify(data.cardObj));
		var prevPlayerObj = this.members[this.playerArr[data.cardObj.player]];
		prevPlayerObj.hand.splice(data.cardObj.index, 1);
		if (this.gameEngine.roundOver(this.currentRound) === true) {
			var roundWinner = this.gameEngine.processRound(this.currentRound, this.round.length, this.trump);
			sendData.push({dest:ALL, event:events.play, message:"PLAY",  data:{play:true, player:-1, cardObj:data.cardObj}});
			sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:SLEEP_SECONDS});
			sendData.push({dest:ALL, event:events.round, message:"Round",  data:{prevRound:this.currentRound, winner:roundWinner}});
			this.updatePoints(roundWinner.player, roundWinner.points);
			this.round.push({winner:roundWinner.player, points:roundWinner.points, round:this.currentRound});
			this.currentRound = [];
			if (this.gameEngine.gameOver(this.round, this.handCount) === true) {
				sendData.push({dest:ALL, event:events.game, message:"Game",  data:{prevGame:{allRounds:this.round, stats:this.getGameStats()}}});
				sendData.push({dest:ALL , event:events.ready, message:"READY",  data:this.getReadyData()});
				this.allGames.push(this.round);
				this.round = [];
				this.gameStarter++;
				this.gameStarter %= this.totalPlayers;
				this.testGamePlay = false;
				this.startPrePlay(sendData);
				return sendData;
			} else {
				this.currentPlayer = roundWinner.player;
				data.cardObj = {};
				//Round over
			}
		} else {
			//Round continues
		}
		data.player = this.currentPlayer;
		this.setNextPlayerTurn(data, sendData);
		return sendData;
	};

	this.computerPlay = function (playerObj, data, sendData) {
		sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:SLEEP_SECONDS});
		//console.log("Getting next BestCard for "+playerObj.position);
		var bestCard = this.gameEngine.bestCard(playerObj, this.currentRound, this.trump, this.round.length);
		//Reveal will never be true for Spades and Hearts
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
		this.processNextPlay(data, sendData, false);
	};

	this.computerPrePlay = function (playerObj, data, sendData) {
		if (data.bidObj.bid === false) {
			//console.log("Before setting trump"+ JSON.stringify(data));
			data.trump = this.gameEngine.setTrump(playerObj, this.trump);
			//console.log("After setting trump"+ JSON.stringify(data));
		} else {
			//console.log("Bidding continues");
			sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:SLEEP_SECONDS});
			var bestBid = this.gameEngine.bestBid(playerObj, data.bidObj, this.trump);
			if (bestBid.pass === true) {
				data.pass = bestBid.pass;
			} else {
				data.bidObj.points = bestBid.points;
				data.bidObj.bidder = this.currentPlayer;
			}
		}
		this.processPrePlay(data, sendData);
	};

	this.startPrePlay = function (sendData) {
		this.setNewGame();
		var playerObj = this.members[this.playerArr[this.currentPlayer]];
		var data = {player:this.currentPlayer, trump:null, play:false,
			bidObj:{minimum:true, bid:true, bidder:this.currentPlayer, points:this.minimumBid}
		};
		if (this.cutToChase === true) {
			//data.bidObj.bid = false;
			this.trump.card = this.gameEngine.setTrump(playerObj, this.trump);
			this.trump.setter = this.currentPlayer;
			this.trump.points = this.minimumBid;
			this.sendPlayerCards(sendData);
			this.startPlay(sendData);
		} else {
			this.sendPlayerCards(sendData, 1);
			this.setNextPlayerTurn(data, sendData);
		}
	};

	this.processPrePlay = function (data, sendData) {
		var playerObj;
		if (data.trump !== null) {
			this.firstBid = this.currentBid;
			this.bidData = [];
			this.trump.setter = data.bidObj.bidder;
			this.trump.points = data.bidObj.points;
			if (this.trump.card !== null) {
				//console.log("SETTING TRUMP:"+JSON.stringify(this.trump));
				this.trump.card = data.trump;
				this.startPlay(sendData);
				return sendData;
			} else  {
				this.trump.card = data.trump;
				this.sendPreGameInfo(sendData, 1);
				for (var key in this.members) {
					var userObj = this.members[key];
					if (userObj.human)
						sendData.push({dest:SENDER, receiver:userObj.name, event:events.cards, message:"Cards",  data:{set:2, cards:userObj.getCardSet(2)}});
				}
				this.currentPlayer = this.gameStarter;
				data.bidObj.bid = true;
				data.bidObj.points = this.gameEngine.getMinimumBid(1);
				data.bidObj.bidder = this.currentPlayer;
				data.trump = null;
				data.player = this.currentPlayer;
			}
		} else {
			//<testing_mode>
			if (this.members[this.playerArr[this.currentPlayer]].human && this.allGames.length < this.testGamePlayCount) {
				this.testGamePlay = true;
			}
			//</testing_mode>
			var dupData = JSON.parse(JSON.stringify(data));
			dupData.player = -1;
			dupData.play = false;
			dupData.bidObj.bid = false;
			dupData.bidObj.trump = false;
			dupData.bidObj.bidder = data.player;
			sendData.push({dest:ALL, event:events.play, message:"PLAY", data:dupData});
			if (data.bidObj.minimum === true || (data.pass === false && this.currentBid < data.bidObj.points)) {
				data.bidObj.bidder = this.currentPlayer;
				data.bidObj.minimum = false;
				this.currentBid = data.bidObj.points;
				this.currentBidder = this.currentPlayer;
				this.bidData.push([this.currentPlayer, this.currentBid]);
			} else {
				this.bidData.push([this.currentPlayer, "-"]);
			}
			delete data.pass;
			this.prePlayCount++;
			this.currentPlayer++;
			this.currentPlayer %= this.totalPlayers;
			if (this.prePlayCount == this.totalPlayers) {
				data.bidObj.bid = false;
				data.bidObj.points = this.currentBid;
				data.player = data.bidObj.bidder;
				console.log("Reached here for trump setting first time");
			} else if (this.prePlayCount == 2 * this.totalPlayers) {
				this.prePlayCount = 0;
				if (this.firstBid === this.currentBid) {
					this.startPlay(sendData);
					return sendData;
				}
				data.bidObj.bid = false;
				data.bidObj.points = this.currentBid;
				data.player = data.bidObj.bidder;
				console.log("Reached here for trump setting second time");
			} else {
				data.player = this.currentPlayer;
			}
		}
		this.setNextPlayerTurn(data, sendData);
		return sendData;
	};

	this.sendCurrentState = function (playerObj, sendData) {
		var details = this.getReadyData();
		var trump_card = (this.trump.revealed === true || this.trump.setter == playerObj.position) ? this.trump.card : null;
		if (this.prePlayOver === true) {
			sendData.push({dest:SENDER, event:events.ready, message:"READY", data:{inProgress:true, players:this.playerArr, details:details.details, round:this.currentRound, trumpData:{setter:this.trump.setter, points:this.trump.points, revealed:this.trump.revealed, card:trump_card}}});
			sendData.push({dest:SENDER, event:events.cards, message:"CARDS",  data:{set:1, cards:playerObj.hand}});
		} else {
			sendData.push( {dest:SENDER, event:events.ready, message:"READY",
				data:{inProgress:true, details:details.details, players:this.playerArr, bidData:this.bidData, trumpData:{setter:this.trump.setter, points:this.trump.points}}
			});
			sendData.push({dest:SENDER, event:events.cards, message:"CARDS",  data:{set:1, cards:playerObj.getCardSet(1)}});
			if (this.trump.card !== null) {
				sendData.push({dest:SENDER, event:events.cards, message:"CARDS",  data:{set:2, cards:playerObj.getCardSet(2)}});
			}
		}
	};

	this.resumeOnPlayerLeave = function (playerObj, sendData) {
		//this function is no longer needed for actual play.
		//It is needed for testing gameplay with two human players
		//Game will gets stuck in that case (Do not test gameplay with two human players)
		if (this.prePlayOver === true) {
			//var cardData = {play:true, player:this.currentPlayer, cardObj:{}};
			//this.computerPlay(playerObj, cardData, sendData);
		} else {
			//var bidObj = {bid:true, bidder:this.currentBidder, points:this.currentBid };
			//var bidData = {player:this.currentPlayer, trump:null, play:false, bidObj:bidObj};
			//this.computerPrePlay(playerObj, bidData, sendData);
		}
	};
}

trump_table.prototype = new tableClass.obj();
trump_table.prototype.constructor = trump_table;

function spades_table(num, room, game) {
	trump_table.call(this, num, room, game);
	this.constantTrump = this.fullCardDeck[0];

	this.startPrePlay = function (sendData) {
		this.setNewGame();
		var data = {player:this.currentPlayer, play:false,
			bidObj: {bid:true, bidder:this.currentPlayer, points:"00"}
		};

		if (this.cutToChase === false) {
			this.setNextPlayerTurn(data, sendData);
		} else {
			this.sendPlayerCards(sendData);
			this.startPlay(sendData);
		}
	};

	this.sendPreGameInfo = function (sendData, round) {
		sendData.push({dest:ALL , event:events.sleep, message:"SLEEP",  data:SLEEP_SECONDS});
		sendData.push({dest:ALL, event:events.play, message:"PLAY",
			data:{play:false, player:-1, bidObj:{bid:false, bidder:this.trump.setter, points:this.trump.points, trump:true, round:2, index:-1}}
		});
	};

	this.computerPrePlay = function (playerObj, data, sendData) {
		var bestBid = this.gameEngine.bestBid(playerObj, data.bidObj, this.trump);
		data.pass = bestBid.pass;
		data.bidObj.points = bestBid.points;
		this.processPrePlay(data, sendData);
	};

	this.processPrePlay = function (data, sendData) {
		var playerObj;
		playerObj = this.members[this.playerArr[data.player]];
		if (this.prePlayCount < this.totalPlayers) {
			if (data.pass === false) {
				this.bidData[data.player] = [data.player, data.bidObj.points];
			} else {
				this.bidData[data.player] = [data.player, "-"];
			}
		} else {
			if (this.bidData[data.player][1] == "-") {
				this.bidData[data.player][1] = data.bidObj.points;
			}
		}
		console.log(JSON.stringify(this.bidData[data.player]));
		delete data.pass;
		this.prePlayCount++;
		this.currentPlayer++;
		this.currentPlayer %= this.totalPlayers;
		var dupData = JSON.parse(JSON.stringify(data));
		dupData.player = -1;
		dupData.play = false;
		dupData.pass = false;
		dupData.bidObj.bid = false;
		dupData.bidObj.points = this.bidData[data.player][1];
		dupData.bidObj.trump = false;
		dupData.bidObj.bidder = data.player;
		sendData.push({dest:ALL, event:events.play, message:"PLAY", data:dupData});
		if (this.prePlayCount == this.totalPlayers) {
			data.bidObj.points = this.gameEngine.getMinimumBid(0);
			this.sendPlayerCards(sendData);
		} else if (this.prePlayCount == 2 * this.totalPlayers) {
			this.startPlay(sendData);
			return sendData;
		}
		data.player = this.currentPlayer;
		this.setNextPlayerTurn(data, sendData);
		return sendData;
	};
}
spades_table.prototype = new trump_table();
spades_table.prototype.constructor = spades_table;

function hearts_table (num, room, game) {
	trump_table.call(this, num, room, game);
	this.constantTrump = this.fullCardDeck[13]; //ACE OF HEARTS

	this.startPrePlay = function (sendData) {
		this.setNewGame();
		this.sendPlayerCards(sendData);
		this.passData = [];
		var data = {player:this.currentPlayer, play:false, game:(this.allGames.length%this.totalPlayers)};

		if (this.cutToChase === false && this.allGames.length%this.totalPlayers !== NOPASS) {
			this.setNextPlayerTurn(data, sendData);
		} else {
			this.startPlay(sendData);
		}
	};

	this.getPassedCards = function (playerObj) {
		var arr = [];
		for (var i = 0; i < playerObj.passCards.length; i++) {
			arr.push(playerObj.hand[playerObj.passCards[i]]);
		}
		return arr;
	};

	this.changePlayerHands = function() {
		var i, j, playerObj;
		for (i = 0; i < this.playerArr.length; i++) {
			playerObj = this.members[this.playerArr[i]];
			for (j = 0; j < playerObj.passCards.length; j++) {
				playerObj.hand[playerObj.passCards[j]] = this.passCards[i][j];
			}
		}
	};

	this.findGameStarter = function () {
		var i, j, playerObj;
		for (i = 0; i < this.playerArr.length; i++) {
			playerObj = this.members[this.playerArr[i]];
			for (j = 0; j < playerObj.hand.length; j++) {
				if (playerObj.hand[j].name == "2C") {
					console.log("2C is with " + playerObj.name);
					this.gameStarter = playerObj.position;
				}
			}
		}
	};

	this.sendPreGameInfo = function (sendData, round) {
		this.prePlayOver = true;
		var i, userObj;
		var game = this.allGames.length%this.totalPlayers;
		if (this.cutToChase === true || game === NOPASS) {
			this.findGameStarter();
			sendData.push({dest:ALL, event:events.play, message:"PLAY", data:{play:false, player:-1, passOver:true}});
			return;
		}
		var offset = this.totalPlayers;
		if (game === PASSLEFT) {
			offset = offset - 1;
		} else if (game === PASSACROSS) {
			offset = offset - 2;
		} else if (game === PASSRIGHT) {
			offset = offset - 3;
		}
		this.passCards = [];
		for (i = 0; i < this.playerArr.length; i++) {
			userObj = this.members[this.playerArr[i]];
			var passedPlayer = (userObj.position+offset)%this.totalPlayers;
			var cards = this.getPassedCards(this.members[this.playerArr[passedPlayer]]);
			this.passCards.push(cards);
			if (userObj.human === true) {
				sendData.push({dest:SENDER, receiver:userObj.name, event:events.play, message:"PLAY", data:{play:false, player:userObj.position, passOver:true, cardIndexArr: userObj.passCards, cards:cards}});
			}
		}
		this.changePlayerHands();
		this.findGameStarter();
	};

	this.computerPrePlay = function (playerObj, data, sendData) {
		data.passCards = this.gameEngine.getPassCards(playerObj);
		this.processPrePlay(data, sendData);
	};

	this.processPrePlay = function (data, sendData) {
		var playerObj = this.members[this.playerArr[data.player]];
		playerObj.passCards = data.passCards;
		this.prePlayCount++;
		this.currentPlayer++;
		this.currentPlayer %= this.totalPlayers;
		delete data.passCards;
		//delete data.game;
		if (this.prePlayCount == this.totalPlayers) {
			this.startPlay(sendData);
			return sendData;
		}
		data.player = this.currentPlayer;
		this.setNextPlayerTurn(data, sendData);
		return sendData;
	};

	this.sendCurrentState = function (playerObj, sendData) {
		var details = this.getReadyData();
		var data = {player:this.currentPlayer, play:false, game:(this.allGames.length%this.totalPlayers)};
		sendData.push({dest:SENDER, event:events.ready, message:"READY", data:{inProgress:true, details:details.details, players:this.playerArr, round:this.currentRound}});
		sendData.push({dest:SENDER, event:events.cards, message:"CARDS",  data:{set:1, cards:playerObj.hand}});
		if (this.prePlayOver === true) {
			sendData.push({dest:SENDER, event:events.play, message:"PLAY", data:{play:false, player:this.currentPlayer, passOver:this.prePlayOver, cards:null}});
		} else {
			sendData.push({dest:SENDER, event:events.play, message:"PLAY", data:data});
		}
	};

	this.resumeOnPlayerLeave = function (playerObj, sendData) {
		//this function is no longer needed for actual play.
		//It is needed for testing gameplay with two human players
		//Game will gets stuck in that case (Do not test gameplay with two human players)
		if (this.prePlayOver === true) {
			//var cardData = {play:true, player:this.currentPlayer, cardObj:{}};
			//this.computerPlay(playerObj, cardData, sendData);
		} else {
			//var data = {player:this.currentPlayer, play:false};
			//this.computerPrePlay(playerObj, data, sendData);
		}
	};
}

hearts_table.prototype = new trump_table();
hearts_table.prototype.constructor = hearts_table;

function ass_table (num, room, game) {
	trump_table.call(this, num, room, game);
	this.constantTrump = this.fullCardDeck[0]; //ACE OF Spades

	this.startPrePlay = function (sendData) {
		this.setNewGame();
		this.sendPlayerCards(sendData);
		this.passData = [];
		this.startPlay(sendData);
	};
}

ass_table.prototype = new trump_table();
ass_table.prototype.constructor = ass_table;

