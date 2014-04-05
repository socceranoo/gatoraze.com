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

exports.getTotalPoints = function (num) {
	var game = [28, 0, 48, 0, 88];
	return game[num - 4];
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
	var i = 0;
	if (playerObj.hand.length === 1 && trump.revealed === false && playerObj.position == trump.setter) {
		return {card: trump.card, index:index, reveal:true};
	}
	if (round.length === 0 ) {
		//console.log("First Card");
		return {card: playerObj.hand[index], index:index};
	}
	for (i = 0; i < playerObj.hand.length ; i++) {
		if(round[0].card.suit.name == playerObj.hand[i].suit.name){
			//console.log("Lead Card:"+round[0].card.name+" My card:"+playerObj.hand[i].name);
			return {card: playerObj.hand[i], index:i};
		}
	}
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
	//console.log("Lead Card:"+round[0].card.name+" My card:"+playerObj.hand[index].name+" Trump Revealed is :"+trump.revealed);
	return {card: playerObj.hand[index], index:index};
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
		if (round[0].card.suit.name == playerObj.hand[i].suit.name){
			suitFound = true;
			message = 'Cannot reveal trump when you have the suit';
		}
	}
	return [!suitFound, message];
};
exports.isValidCard = function (playerObj, card, round, roundNumber, trump) {
	var message = '';
	var i = 0;
	var trumpCount = 0;
	var trumpFound = false;
	var suitFound = false;

	var message1 = 'Cannot play trump before it is revealed';
	var message2 = 'Cannot play other suit than the trump when you have revealed it';
	var message3 = 'Cannot play some other suit than the lead card suit';
	for (i = 0; i < playerObj.hand.length ; i++) {
		if (trump.card.suit.name == playerObj.hand[i].suit.name){
			trumpCount++;
		}
		if (round.length > 0 && round[0].card.suit.name == playerObj.hand[i].suit.name){
			suitFound = true;
		}
	}
	if (round.length === 0 ) {
		if (playerObj.position == trump.setter && card.suit.name == trump.card.suit.name && trump.revealed === false) {
			if (trumpCount < playerObj.hand.length) {
				return [false, message1];
			}
		}
		return [true, message];
	}
	if (card.suit.name == round[0].card.suit.name) {
		return [true, message];
	}
	if (trump.revealRound == roundNumber && trump.revealer == playerObj.position) {
		if (card.suit.name != trump.card.suit.name && trumpCount > 0) {
			return [false, message2];
		}
		return [true, message];
	}
	return [!suitFound, message3];
};
exports.bestBid = function (playerObj, bidObj, trump) {
	if (trump === null) {
		return {points: bidObj.points+1};
	}else {
		return {pass:true, points: bidObj.points};
	}
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

