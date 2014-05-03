var getPointsObj = function () {
	return {
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
		"K": {rank:2, points:0},
	};
};
exports.site = "Spades";
exports.server = "Spades Server";
exports.getMinimumBid = function (game, round) {
	return 0;
};

exports.getTotalPoints = function (num) {
	var game = [28, 0, 48, 0, 88];
	return game[num - 4];
};
exports.processRound = function (round, roundNumber, trump) {
	var pointsObj = getPointsObj();
	var leadObj = round[0];
	var firstTrump = false;
	for (var i = 1; i < round.length; i++) {
		if (round[i].card.suit.name == leadObj.card.suit.name) {
			if (pointsObj[round[i].card.rank.name].rank <= pointsObj[leadObj.card.rank.name].rank) {
				leadObj = round[i];
			}
		} else if (trump.revealed === true && round[i].card.suit.name == trump.card.suit.name) {
			if (firstTrump === false) {
				firstTrump = true;
				leadObj = round[i];
			} else {
				if (pointsObj[round[i].card.rank.name].rank <= pointsObj[leadObj.card.rank.name].rank) {
					leadObj = round[i];
				}
			}
		}
	}
	return {player:leadObj.player, points:1};
};
exports.bestCard = function (playerObj, round, trump) {
	var cardIndexArr;
	if (round.length) {
		cardIndexArr = Object.keys(getValidMiddleCards(playerObj, round, trump));
	} else {
		cardIndexArr = Object.keys(getValidOpeningCards(playerObj, trump));
	}
	var index = cardIndexArr[0];
	return {card: playerObj.hand[index], index:index};
};

exports.revealTrump = function (playerObj, round, trump) {
	var message = '';
	if (trump.revealed === true) {
		message = 'Trump already revealed';
		return [false, message];
	}
};

exports.isValidCard = function (playerObj, cardObj, round, roundNumber, trump) {
	var validArr = null;
	var message = 'Not a valid Card';
	if (round.length) {
		validArr = getValidMiddleCards(playerObj, round, trump);
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
	return {pass:false, points: bidObj.points};
};

exports.pruneCardDeck = function (cardDeck, num) {
	return cardDeck;
};

exports.getValidCards = function (playerObj, round, roundNumber, trump) {
	if (playerObj.human === false) {
		return null;
	}
	var cardIndexArr;
	if (round.length) {
		cardIndexArr = Object.keys(getValidMiddleCards(playerObj, round, trump));
	} else {
		cardIndexArr = Object.keys(getValidOpeningCards(playerObj, trump));
	}
	return {cards:cardIndexArr, canReveal:false};
};

var getValidOpeningCards = function (playerObj, trump) {
	var ret = {};
	var i = 0;
	var trumpCount = 0;
	var message1 = 'Cannot play trump before it is revealed';
	//If the current player is not the trump setter or trump is already revealed
	//then any player is free to play any card.
	if (trump.revealed === true) {
		for (i = 0; i < playerObj.hand.length ; i++) {
			ret[i] = true;
		}
		return ret;
	}
	var fullTrump = {};
	for (i = 0; i < playerObj.hand.length ; i++) {
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
var getValidMiddleCards = function (playerObj, round, trump) {
	var anyArr = {};
	var suitArr = {};
	var i = 0;
	var message3 = 'Cannot play some other suit than the lead card suit';
	if (trump.revealed === false && round[round.length - 1].card.suit.name == trump.card.suit.name) {
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
