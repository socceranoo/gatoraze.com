var DIFFICULTY_EASY = 0, DIFFICULTY_MEDIUM = 1, DIFFICULTY_HARD = 2;
var getPointsObj = function () {
	return {
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
};
exports.site = "Trump";
exports.server = "Trump Server";
exports.getMinimumBid = function (game, round) {
	var bid = {28:[14, 20], 48:[24, 36], 88:[44, 67]};
	return bid[game][round];
};

exports.getTotalPoints = function (num) {
	var game = [28, 0, 48, 0, 88];
	return game[num - 4];
};
exports.processRound = function (round, roundNumber, trump) {
	var pointsObj = getPointsObj();
	var leadObj = round[0];
	var points = pointsObj[round[0].card.rank.name].points;
	var firstTrump = false;
	for (var i = 1; i < round.length; i++) {
		if (round[i].card.suit.name == leadObj.card.suit.name) {
			if (pointsObj[round[i].card.rank.name].rank <= pointsObj[leadObj.card.rank.name].rank) {
				leadObj = round[i];
			}
		} else if (trump.revealed === true && round[i].card.suit.name == trump.card.suit.name) {
			if (firstTrump === false) {
				if (roundNumber == trump.revealRound && i < trump.revealPosition) {
					continue;
				}
				firstTrump = true;
				leadObj = round[i];
			} else {
				if (pointsObj[round[i].card.rank.name].rank <= pointsObj[leadObj.card.rank.name].rank) {
					leadObj = round[i];
				}
			}
		}
		points += pointsObj[round[i].card.rank.name].points;
	}
	return {player:leadObj.player, points:points};
};
exports.setTrump = function (playerObj, trump) {
	var index = 1;
	return playerObj.hand[index];
};
exports.bestCard = function (playerObj, round, trump) {
	var index = 0;
	var i = 0;
	var cardIndexArr = null;
	if (playerObj.hand.length === 1 && trump.revealed === false && playerObj.position == trump.setter) {
		return {card: trump.card, index:index, reveal:true};
	}
	if (round.length === 0 ) {
		cardIndexArr = Object.keys(getValidOpeningCards(playerObj, trump));
	} else {
		cardIndexArr = Object.keys(getValidMiddleCards(playerObj, round, trump, round.length));
	}
	index = cardIndexArr[0];
	return {card: playerObj.hand[index], index:index};
	/*
	if (trump.revealed === false) {
		for (i = 0; i < playerObj.hand.length ; i++) {
			if(trump.card.suit.name == playerObj.hand[i].suit.name){
				//console.log("Trump revealed and trump played");
				return {card: playerObj.hand[i], index:i, reveal:true};
			}
		}
		//console.log("Trump revealed and no trump");
		return {card: playerObj.hand[index], index:index, reveal:true};
	}
   */
	//console.log("Lead Card:"+round[0].card.name+" My card:"+playerObj.hand[index].name+" Trump Revealed is :"+trump.revealed);
	//return {card: playerObj.hand[index], index:index};
};
exports.revealTrump = function (playerObj, round, trump) {
	var message = '';
	if (trump.revealed === true) {
		message = 'Trump already revealed';
		return [false, message];
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
exports.isValidCard = function (playerObj, cardObj, round, roundNumber, trump) {
	var validArr = null;
	var message = 'Not a valid Card';
	if (round.length) {
		validArr = getValidMiddleCards(playerObj, round, trump, roundNumber);
	} else {
		validArr = getValidOpeningCards(playerObj, trump);
		message = 'Cannot play trump before it is revealed';
	}
	if (validArr[cardObj.index]) {
		return [true, ''];
	} else {
		return [false, message];
	}
};

exports.bestBid = function (playerObj, bidObj, trump) {
	return {pass:true, points: bidObj.points};
	/*
	if (trump === null) {
		return {points: bidObj.points+1};
	}else {
		return {pass:true, points: bidObj.points};
	}
   */
};
exports.pruneCardDeck = function (cardDeck, num) {
	var ret = [];
	var pointsObj = getPointsObj();
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

exports.getValidCards = function (playerObj, round, roundNumber, trump) {
	if (playerObj.human === false) {
		return null;
	}
	var cardIndexArr;
	if (round.length) {
		cardIndexArr = Object.keys(getValidMiddleCards(playerObj, round, trump, roundNumber));
	} else {
		cardIndexArr = Object.keys(getValidOpeningCards(playerObj, trump));
	}
	var ret = exports.revealTrump(playerObj, round, trump);
	return {cards:cardIndexArr, canReveal:ret[0]};
};

var getValidOpeningCards = function (playerObj, trump) {
	var ret = {};
	var i = 0;
	var trumpCount = 0;
	var message1 = 'Cannot play trump before it is revealed';
	//If the current player is not the trump setter or trump is already revealed
	//then any player is free to play any card.
	if (trump.revealed === true || playerObj.position != trump.setter) {
		for (i = 0; i < playerObj.hand.length ; i++) {
			ret[i] = true;
		}
		return ret;
	}
	var fullTrump = {};
	for (i = 0; i < playerObj.hand.length ; i++) {
		if (trump.card.name == playerObj.hand[i].name){
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
var getValidMiddleCards = function (playerObj, round, trump, roundNumber) {
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
