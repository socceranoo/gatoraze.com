var getPointsObj = function () {
	return {
		"A": {rank:1, points:0},
		"2": {rank:13, points:0, valid:{4:false, 6:false, 8:true}},
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
		"H": {rank:1, points:1},
		"S": {rank:2, points:0},
		"C": {rank:4, points:0},
		"D": {rank:3, points:0},
		"QS": {rank:0, points:13}
	};
};
var pointsObj = getPointsObj();
function createComparator () {
	return function(a, b) {
		var sameSuit = pointsObj[b.suit.name].rank - pointsObj[a.suit.name].rank;
		if (sameSuit === 0) {
			return pointsObj[b.rank.name].rank - pointsObj[a.rank.name].rank;
		} else {
			return sameSuit;
		}
	};
}
exports.sortPlayerHand = function (cardArr) {
	cardArr.sort(createComparator());
};

exports.site = "Hearts";
exports.server = "Hearts Server";

exports.getTotalPoints = function (num) {
	return 26;
};
exports.processRound = function (round, trump) {
	var leadObj = round[0];
	var points = 0;
	var pointsObj = getPointsObj();
	for (var i = 0; i < round.length; i++) {
		if (round[i].card.suit.name == leadObj.card.suit.name) {
			if (pointsObj[round[i].card.rank.name].rank <= pointsObj[leadObj.card.rank.name].rank) {
				leadObj = round[i];
			}
		}
		points += pointsObj[round[i].card.suit.name].points;
		if (round[i].card.name == "QS") {
			points += pointsObj[round[i].card.name].points;
		}
	}
	return {player:leadObj.player, points:points};
};
exports.bestCard = function (playerObj, round, trump) {
	var index = 0;
	var i = 0;
	if (round.length === 0 ) {
		return {card: playerObj.hand[index], index:index};
	}
	for (i = 0; i < playerObj.hand.length ; i++) {
		if(round[0].card.suit.name == playerObj.hand[i].suit.name){
			return {card: playerObj.hand[i], index:i};
		}
	}
	return {card: playerObj.hand[index], index:index};
};
exports.isValidCard = function (playerObj, card, round, roundNumber, trump) {
	var message = '';
	var i = 0;
	var suitFound = false;

	var message1 = 'Cannot play hearts before it is revealed';
	var message3 = 'Cannot play some other suit than the lead card suit';

	if (round.length === 0 ) {
		return [true, message];
	}
	if (card.suit.name == round[0].card.suit.name) {
		return [true, message];
	}
	for (i = 0; i < playerObj.hand.length ; i++) {
		if (round[0].card.suit.name == playerObj.hand[i].suit.name){
			suitFound = true;
		}
	}
	return [!suitFound, message3];
};
exports.getPassCards = function (playerObj) {
	return [0, 1, 2];
};
exports.pruneCardDeck = function (cardDeck, num) {
	//return cardDeck.splice(0, 16);
	return cardDeck;
};

