module.exports = function(obj) {
	var socketObj = obj;
	var exportObj = {};
	var events = {message:"message", welcome:"welcome", playerJoin:"player-join", playerLeave:"player-leave", cards:"cards", play:"play"};
	exportObj.events = events;
	exportObj.site = "Trump";
	exportObj.server = "Trump server";
	var trumpPoints = {
		"A": {rank:5, points:1},
		"2": {rank:1, points:10, valid:{4:false, 6:false, 8:true}},
		"3": {rank:2, points:5, valid:{4:false, 6:true, 8:true}},
		"4": {rank:13, points:0, valid:{4:false, 6:false, 8:false}},
		"5": {rank:12, points:0, valid:{4:false, 6:false, 8:true}},
		"6": {rank:11, points:0, valid:{4:false, 6:false, 8:true}},
		"7": {rank:10, points:0},
		"8": {rank:9, points:0},
		"9": {rank:4, points:2},
		"T": {rank:6, points:1},
		"J": {rank:3, points:3},
		"Q": {rank:8, points:0},
		"K": {rank:7, points:0},
	};

	var trumpBid = {2:[14, 20], 4:[14, 20], 6:[24, 36], 8:[44, 67]};

	var cardObj = require('./card-game')();

	var pruneCardDeck = function (cardDeck, num) {
		var ret = [];
		for (var j = 0 ; j < cardDeck.length; j++) {
			var rank = cardDeck[j].rank.name;
			var validObj = trumpPoints[rank].valid;
			if (validObj) {
				if (!validObj[num]  || validObj[num] === false) {
					continue;
				}
			}
			ret.push(cardDeck[j]);
		}
		return ret;
	};

	function player(name, position, num) {
		this.name = name;
		this.hand = null;
		this.position = position;
		this.points = 0;
		this.team = 0;
		this.ready = false;
	}

	player.prototype.getCardSet = function (set) {
		var first_set = parseInt(this.hand.length / 2 , 10);	
		var second_set = this.hand.length - first_set;
		var start = (set == 1) ? 0 : first_set;
		var end = (set == 1) ? first_set : this.hand.length;
		var ret = this.hand.slice(start, end);
		cardObj.display(ret);
		return ret;
	};

	function trump(num, room) {
		this.round = [];
		this.room = room;
		this.server = exportObj.server;
		//this.server = room+" server";
		this.masterCardDeck = cardObj.createCardDeck();
		//cardObj.shuffle(this.masterCardDeck);
		this.cardDeck = pruneCardDeck(this.masterCardDeck, num);
		this.totalPlayers = num;
		this.members = {};
		this.playerArr = [];
		this.trump = null;
		var cardsPerPlayer = parseInt(this.cardDeck.length/this.totalPlayers , 10);
		var currentPlayer = 0;
		var bidCount = 0;
		var minimumBid = trumpBid[num][0];
		var currentBid = minimumBid;
		var firstBid = minimumBid;

		this.roundComplete = function () {
			this.round.push(this.currentRound);
		};

		this.newRound = function () {
			this.currentRound = [];
		};

		this.addMember = function (member) {
			var sendData = [];
			var message ='';
			if (this.members[member]) {
				message = member+" duplicate login ";
				sendData.push({dest:0 , event:events.message, message:message,  data:null});
				return [false, sendData];
			} else {
				if (this.roomFull()) {
					message = "Room is full try joining someother room";
					sendData.push({dest:0 , event:events.message, message:message,  data:null});
					return [false, sendData];
				}
				var pos = Object.keys(this.members).length;
				this.members[member] = new player(member, pos, cardsPerPlayer);
				this.playerArr[pos] = member;
				var joinedPlayer = this.members[member];
				message = "Welcome to the game room "+this.room;
				var welcomeData = {};
				for (var key in this.members) {
					welcomeData[key] = this.members[key].position;
				}
				sendData.push({dest:0, event:events.welcome, message:message, data:welcomeData});
				message = member + " joined this room " +this.room;
				var data = {name:joinedPlayer.name, position:joinedPlayer.position};
				sendData.push({dest:1, event:events.playerJoin, message:message, data:data});
				if (this.roomFull()) {
					this.startGame(sendData);
				}
				return [true, sendData];
			}
		};

		this.removeMember = function (member) {
			if (this.members[member]) {
				var data = {name:member, position:this.members[member].position};
				delete this.members[member];
				var message = member + " left this room " +this.room;
				return [true, [{dest:1 , event:events.playerLeave, message:message,  data:data}] ];
			}
		};

		this.roomFull = function () {
			return (Object.keys(this.members).length == this.totalPlayers);
		};


		this.setPlayerCards = function (playerObj, start, end) {
			playerObj.hand = [];
			for (var i = start; i < end; i++) {
				playerObj.hand.push(this.cardDeck[i]);
			}
		};
		this.setNewGame = function (sendData) {
			var i = 1, j = 0;
			for (var key in this.members) {
				j = i-1;
				var userObj = this.members[key];
				this.setPlayerCards(userObj, j, j+cardsPerPlayer);
				i+= cardsPerPlayer;
				sendData.push({dest:0, receiver:userObj.name, event:events.cards, message:"Cards",  data:{set:1, cards:userObj.getCardSet(1)}});
			}
			bidCount = 0;
			currentPlayer = 0;
		};

		this.startGame = function (sendData) {
			sendData.push({dest:2 , event:events.message, message:"READY",  data:null});
			this.setNewGame(sendData);
			var curPlayerName = this.playerArr[currentPlayer];
			sendData.push({dest:2, event:events.play, message:"PLAY",
				data:{
					play:false, player:currentPlayer,
					bidObj:{ bid:true, bidder: {name:curPlayerName, position:currentPlayer}, points:minimumBid}
				}
			});
		};

		this.playerPlay = function (data) {
			if (data.play) {
				return this.nextPlayer(data);
			} else {
				return this.nextBidder(data);
			}
		};

		this.nextBidder = function (data) {
			var sendData = [];
			if (data.trump) {
				data.bidObj.bid = true;
				data.bidObj.points = trumpBid[this.totalPlayers][1];
				firstBid = currentBid;
				if (this.trump) {
					data.play = true;
				} else  {
					for (var key in this.members) {
						var userObj = this.members[key];
						sendData.push({dest:0, receiver:userObj.name, event:events.cards, message:"Cards",  data:{set:2, cards:userObj.getCardSet(2)}});
					}
				}
				this.trump = data.trump;
				delete data.trump;
			} else {
				if (currentBid < data.bidObj.points && data.pass !== true) {
					data.bidObj.bidder.position = currentPlayer;
					data.bidObj.bidder.name = this.playerArr[currentPlayer];
					currentBid = data.bidObj.points;
				}
				bidCount++;
				currentPlayer++;
				currentPlayer %= this.totalPlayers;
				if (bidCount == this.totalPlayers) {
					//data.bidObj.points = trumpBid[this.totalPlayers][1];
					data.bidObj.bid = false;
				}
				if (bidCount == 2 * this.totalPlayers) {
					data.bidObj.bid = false;
					data.bidObj.points = currentBid;
					bidCount = 0;
					if (firstBid == currentBid) {
						data.play = true;
					}
				}
			}
			delete data.userInfo;
			delete data.pass;
			data.player = currentPlayer;
			sendData.push({dest:2, event:events.play, message:"PLAY",  data:data});
			return sendData;
		};
	}
	exportObj.createGame = function(game, session, room) {
		var numplayers = (session < 6) ? 4 : 6;
		return new trump(2, room);
		//return new trump(numplayers, room);
	};
	return exportObj;
};
