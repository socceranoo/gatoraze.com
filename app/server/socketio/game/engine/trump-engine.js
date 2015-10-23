var DIFFICULTY_EASY = 0, DIFFICULTY_MEDIUM = 1, DIFFICULTY_HARD = 2;

exports.createNewGame = function (game, num) {
	if (game == "trump") {
		return new trump_engine(num);
	} else if (game == "hearts") {
		return new hearts_engine(num);
	} else {
		return new spade_engine(num);
	}
};

function Engine(game, num) {
	this.game = game;
	this.totalPlayers = num;
	this.pointsObj = {
		"A": {rank:1, points:0},
		"2": {rank:13, points:0},
		"3": {rank:12, points:0},
		"4": {rank:11, points:0},
		"5": {rank:10, points:0},
		"6": {rank:9, points:0},
		"7": {rank:8, points:0},
		"8": {rank:7, points:0},
		"9": {rank:6, points:0},
		"T": {rank:5, points:0},
		"J": {rank:4, points:0},
		"Q": {rank:3, points:0},
		"K": {rank:2, points:0}
	};

	this.suitObj = {
		"S": {rank:1, points:0},
		"H": {rank:2, points:0},
		"C": {rank:3, points:0},
		"D": {rank:4, points:0}
	};

	this.getMinimumBid = function (round) {
		return 0;
	};

	this.pruneCardDeck = function (cardDeck) {
		var ret = [];
		var pointsObj = this.pointsObj;
		var num = this.totalPlayers;
		for (var j = 0 ; j < cardDeck.length; j++) {
			var rank = cardDeck[j].rank.name;
			var validObj = pointsObj[rank].valid;
			if (validObj) {
				if (!validObj[num]  || validObj[num] === false) {
					continue;
				}
			}
			ret.push(cardDeck[j]);
		}
		return ret;
	};

	this.sortPlayerHand = function (cardArr) {
		var suitObj = this.suitObj;
		var pointsObj = this.pointsObj;
		cardArr.sort(function () {
			return function(a, b) {
				var sameSuit = suitObj[b.suit.name].rank - suitObj[a.suit.name].rank;
				if (sameSuit === 0) {
					return pointsObj[b.rank.name].rank - pointsObj[a.rank.name].rank;
				} else {
					return sameSuit;
				}
			};
		}());
	};

	this.setTrump = function (playerObj, trump) {
		var index = 0;
		return playerObj.hand[index];
	};

	this.roundOver = function(round) {
		if (round.length == this.totalPlayers) {
			return true;
		} else {
			return false;
		}
	};
	this.gameOver = function (allRounds, initialHandCount) {
		if (allRounds.length == initialHandCount) {
			return true;
		} else {
			return false;
		}
	};
	this.isValidCard = function (playerObj, cardObj, round, roundNumber, trump) {
		var validArr = null;
		var message = 'Not a valid Card';
		if (round.length) {
			validArr = this.getValidMiddleCards(playerObj, round, trump, roundNumber);
		} else {
			validArr = this.getValidOpeningCards(playerObj, roundNumber, trump);
			message = 'Cannot play trump before it is revealed';
		}
		if (validArr[cardObj.index]) {
			return [true, ''];
		} else {
			return [false, message];
		}
	};

	this.bestBid = function (playerObj, bidObj, trump) {
		return {pass:true, points: bidObj.points};
		/*
		if (trump === null) {
			return {points: bidObj.points+1};
		}else {
			return {pass:true, points: bidObj.points};
		}
	   */
	};

	this.getValidCards = function (playerObj, round, roundNumber, trump) {
		if (playerObj.human === false) {
			return null;
		}
		var cardIndexArr;
		if (round.length) {
			cardIndexArr = Object.keys(this.getValidMiddleCards(playerObj, round, trump, roundNumber));
		} else {
			cardIndexArr = Object.keys(this.getValidOpeningCards(playerObj, roundNumber, trump));
		}
		var ret = this.revealTrump(playerObj, round, trump);
		return {cards:cardIndexArr, canReveal:ret[0]};
	};

	this.checkGameSanity = function(cardDeck, allRounds) {
		var index_map = [];
		var i = 0;
		var sane = true;
		for (i = 0 ; i < 52; i++) {
			index_map.push(0);
		}
		for (i = 0 ; i < allRounds.length; i++) {
			var roundObj = allRounds[i];
			if (roundObj.round.length != this.totalPlayers) {
				console.log("Round "+i+" has only "+roundObj.round.length+" cards and not "+this.totalPlayers+" cards");
				sane = false;
			}
			for (var j = 0; j < roundObj.round.length; j++) {
				index_map[roundObj.round[j].card.index] += 1;
			}
		}
		for (i = 0 ; i < cardDeck.length; i++) {
			if (index_map[cardDeck[i].index] === 0 ) {
				console.log("Card "+cardDeck[i].name+" did not appear at all");
				sane = false;
			} else if (index_map[cardDeck[i].index] > 1 ) {
				console.log("Card "+cardDeck[i].name+" appeared twice");
				sane = false;
			}
		}
		if (sane === true) {
			console.log("Game is Sane");
		}
		return sane;
	};

	this.getValidOpeningCards = function (playerObj, roundNumber, trump) {
		var ret = {};
		var i = 0;
		var trumpCount = 0;
		//Hearts first valid card should only be 2C
		if (trump.setter < 0 && roundNumber === 0 && trump.card.name == "AH") {
			for (i = 0; i < playerObj.hand.length ; i++) {
				if (playerObj.hand[i].name == "2C") {
					ret[i] = true;
					break;
				}
			}
			return ret;
		}
		//If the current player is not the trump setter or trump is already revealed
		//then any player is free to play any card.
		//Trump setter will be -1 in Spades game
		if (trump.revealed === true || (trump.setter >= 0 && playerObj.position != trump.setter)) {
			for (i = 0; i < playerObj.hand.length ; i++) {
				ret[i] = true;
			}
			return ret;
		}
		var fullTrump = {};
		for (i = 0; i < playerObj.hand.length ; i++) {
			//Trump setter will be -1 in Spades game
			if (playerObj.position === trump.setter && trump.card.name == playerObj.hand[i].name){
				trumpCount++;
				continue;
			}
			if (trump.card.suit.name == playerObj.hand[i].suit.name){
				trumpCount++;
				fullTrump[i] = true;
			} else {
				ret[i] = true;
			}
		}
		//If the player only have trumps in hand and no other cards and Trump not revealed.
		if (trumpCount == playerObj.hand.length) {
			return fullTrump;
		}
		return ret;
	};

	this.bestCard = function (playerObj, round, trump, roundNumber) {
		var index = 0;
		var cardIndexArr = null;
		//Trump setter will be -1 in Spades game and in Hearts Game
		if (playerObj.position === trump.setter && playerObj.hand.length === 1 && trump.revealed === false) {
			return {card: trump.card, index:index, reveal:true};
		}
		if (round.length ) {
			cardIndexArr = Object.keys(this.getValidMiddleCards(playerObj, round, trump, roundNumber));
		} else {
			cardIndexArr = Object.keys(this.getValidOpeningCards(playerObj, roundNumber, trump));
		}
		index = cardIndexArr[0];
		return {card: playerObj.hand[index], index:index};
	};

	this.processRound = function (round, roundNumber, trump) {
		var pointsObj = this.pointsObj;
		var leadObj = round[0];
		var points = pointsObj[round[0].card.rank.name].points;
		for (var i = 1; i < round.length; i++) {
			points += pointsObj[round[i].card.rank.name].points;
			if (round[i].card.suit.name == leadObj.card.suit.name) {
				if (pointsObj[round[i].card.rank.name].rank <= pointsObj[leadObj.card.rank.name].rank) {
					leadObj = round[i];
				}
			} else if (trump.revealed === true && round[i].card.suit.name == trump.card.suit.name) {
				//Trump setter will be -1 in Spades game
				if (trump.setter >=0 && roundNumber == trump.revealRound && i < trump.revealPosition) {
					console.log("Reached Trump but not valid trump");
					continue;
				}
				leadObj = round[i];
			}
		}
		if (trump.setter < 0) {
			points = 1;
		}
		return {player:leadObj.player, points:points};
	};

	this.getValidMiddleCards = function (playerObj, round, trump, roundNumber) {
		var anyArr = {};
		var suitArr = {};
		var i = 0;
		var message3 = 'Cannot play some other suit than the lead card suit';
		//console.log("Round Number :" +roundNumber);
		//console.log(JSON.stringify(round));
		if (trump.revealed === false && round.length > 0 && round[round.length - 1].card.suit.name == trump.card.suit.name) {
			trump.revealed = true;
		}
		for (i = 0; i < playerObj.hand.length ; i++) {
			anyArr[i] = true;
			if (round[0].card.suit.name == playerObj.hand[i].suit.name){
				suitArr[i] = true;
			}
		}
		if (Object.keys(suitArr).length) {
			return suitArr;
		}
		return anyArr;
	};

	this.revealTrump = function (playerObj, round, trump) {
		var message = '';
		if (trump.revealed === true) {
			message = 'Trump already revealed';
			return [false, message];
		}
		return [false, message];
	};

}

function trump_engine (num) {
	Engine.call(this, 'trump', num);
	this.pointsObj = {
		"A": {rank:5, points:1, valid:{4:true, 6:true, 8:true}},
		"2": {rank:1, points:10, valid:{4:false, 6:false, 8:true}},
		"3": {rank:2, points:5, valid:{4:false, 6:true, 8:true}},
		"4": {rank:13, points:0, valid:{4:false, 6:false, 8:false}},
		"5": {rank:12, points:0, valid:{4:false, 6:false, 8:true}},
		"6": {rank:11, points:0, valid:{4:false, 6:false, 8:true}},
		"7": {rank:10, points:0, valid:{4:true, 6:true, 8:true}},
		"8": {rank:9, points:0, valid:{4:true, 6:true, 8:true}},
		"9": {rank:4, points:2, valid:{4:true, 6:true, 8:true}},
		"T": {rank:6, points:1, valid:{4:true, 6:true, 8:true}},
		"J": {rank:3, points:3, valid:{4:true, 6:true, 8:true}},
		"Q": {rank:8, points:0, valid:{4:true, 6:true, 8:true}},
		"K": {rank:7, points:0, valid:{4:true, 6:true, 8:true}}
	};
	this.getMinimumBid = function (round) {
		var bid = {28:[14, 20], 48:[24, 36], 88:[44, 67]};
		return bid[this.getTotalPoints()][round];
	};

	this.getTotalPoints = function () {
		var obj = [28, 0, 48, 0, 88];
		return obj[this.totalPlayers - 4];
	};

	this.getValidMiddleCards = function (playerObj, round, trump, roundNumber) {
		var anyArr = {};
		var suitArr = {};
		var trumpArr = {};
		var i = 0;
		var trumpCount = 0;
		var trumpFound = false;
		var message2 = 'Cannot play other suit than the trump when you have revealed it';
		var message3 = 'Cannot play some other suit than the lead card suit';
		for (i = 0; i < playerObj.hand.length ; i++) {
			if (trump.revealed === false && trump.card.name == playerObj.hand[i].name){
				trumpCount++;
				continue;
			}
			anyArr[i] = true;
			if (trump.card.suit.name == playerObj.hand[i].suit.name){
				trumpCount++;
				trumpArr[i] = true;
			}
			if (round[0].card.suit.name == playerObj.hand[i].suit.name){
				suitArr[i] = true;
			}
		}
		if (Object.keys(suitArr).length) {
			return suitArr;
		}
		if (trump.revealRound == roundNumber && trump.revealer == playerObj.position) {
			if (Object.keys(trumpArr).length) {
				return trumpArr;
			}
		}
		return anyArr;
	};

	this.revealTrump = function (playerObj, round, trump) {
		var message = '';
		if (trump.revealed === true) {
			message = 'Trump already revealed';
			return [true, message];
		}
		if (playerObj.hand.length === 1 && playerObj.position == trump.setter) {
			return [true, message];
		}
		if (round.length === 0 ) {
			message = 'Cannot reveal trump when you are playing first';
			return [false, message];
		}
		var suitFound = false;
		for (var i = 0; i < playerObj.hand.length ; i++) {
			if (trump.card.name == playerObj.hand[i].name)
				continue;
			if (round[0].card.suit.name == playerObj.hand[i].suit.name){
				suitFound = true;
				message = 'Cannot reveal trump when you have the suit';
			}
		}
		return [!suitFound, message];
	};
}
trump_engine.prototype = new Engine();
trump_engine.prototype.constructor = trump_engine;

function spade_engine(num) {
	Engine.call(this, 'spades', num);
	this.getTotalPoints = function () {
		return 13;
	};

}
spade_engine.prototype = new Engine();
spade_engine.prototype.constructor = spade_engine;

function hearts_engine(num) {
	Engine.call(this, 'hearts', num);
	this.suitObj = {
		"H": {rank:1, points:1},
		"S": {rank:2, points:0},
		"C": {rank:4, points:0},
		"D": {rank:3, points:0}
	};

	this.getTotalPoints = function () {
		return 26;
	};

	this.processRound = function (round, roundNumber, trump) {
		var leadObj = round[0];
		var points = 0;
		var pointsObj = this.pointsObj;
		var suitObj = this.suitObj;
		for (var i = 0; i < round.length; i++) {
			if (round[i].card.suit.name == leadObj.card.suit.name) {
				if (pointsObj[round[i].card.rank.name].rank <= pointsObj[leadObj.card.rank.name].rank) {
					leadObj = round[i];
				}
			}
			if (round[i].card.name == "QS") {
				points += 13;
			} else {
				points += suitObj[round[i].card.suit.name].points;
			}
		}
		return {player:leadObj.player, points:points};
	};

	this.getPassCards = function (playerObj) {
		return [0, 1, 2];
	};
}
hearts_engine.prototype = new Engine();
hearts_engine.prototype.constructor = hearts_engine;
