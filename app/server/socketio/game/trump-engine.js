var getPointsObj = function () {
	return {
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
};
exports.site = "Trump";
exports.server = "Trump Server";
exports.getMinimumBid = function (game, round) {
	var bid = {28:[14, 20], 48:[24, 36], 88:[44, 67]};
	return bid[game][round];
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
		points += pointsObj[round[i].card.rank.name].points;
	}
	return {player:leadObj.player, points:points};
};
exports.setTrump = function (playerObj, trump) {
	var index = 0;
	return playerObj.hand[index];
};
exports.bestCard = function (playerObj, round, trump) {
	var index = 0;
	return {card: playerObj.hand[index], index:index};
};
exports.isValidCard = function (playerObj, card, round, trump) {
	var message = '';
	if (round.length === 0 ) {
		return [true, message];
	}
	if (card.suit.name == round[0].card.suit.name) {
		return [true, message];
	}
	var suitFound = false;
	for (var i = 0; i < playerObj.hand.length ; i++) {
		if (round[0].card.suit.name == playerObj.hand[i].suit.name){
			suitFound = true;
			message = 'Cannot play some other suit than the lead card suit';
		}
	}
	return [!suitFound, message];
};
exports.bestBid = function (playerObj, bidObj, trump) {
	if (trump === null) {
		return {points: bidObj.points+1};
	}else {
		return {pass:true, points: bidObj.points};
	}
};
exports.pruneCardDeck = function (cardDeck, num, testPlayers) {
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
	return ret.slice(0, 4*testPlayers);
};

