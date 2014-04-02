var bgPosForCardIndex = function (actIndex) {
	var index = actIndex - 1;
	var card_w = 111;
	var card_h = 148;
	var suit = parseInt(index/13, 10);
	var rem = index%13;
	var card = (suit * 13)+rem+2;
	var rw = parseInt(card/9, 10);
	var cl = card%9 +1;
	var x_pos = cl * card_w;
	var y_pos = -1 * rw * card_h;
	var pos = [x_pos, y_pos];
	return pos;
};
function card(rank, suit) {
	this.name = rank.name+suit.name;
	this.rank = rank;
	this.suit = suit;
	this.index = (suit.index * 13) + rank.index;
	this.bgPos = bgPosForCardIndex(this.index);
}
exports.createCardDeck = function () {
	var masterCardDeck = [];
	var suitArr = [{ name:"S", index:0 }, { name:"H", index:1 }, { name:"C", index:2 }, { name:"D", index:3 }];
	var rankArr = [
		{ name:"A", index:1 }, { name:"2", index:2 }, { name:"3", index:3 }, { name:"4", index:4 }, { name:"5", index:5 },
		{ name:"6", index:6 }, { name:"7", index:7 }, { name:"8", index:8 }, { name:"9", index:9 }, { name:"T", index:10 },
		{ name:"J", index:11 }, { name:"Q", index:12 }, { name:"K", index:13 }
	];
	for (var i = 0 ; i < suitArr.length; i++) {
		for (var j = 0 ; j < rankArr.length; j++) {
			masterCardDeck.push(new card(rankArr[j], suitArr[i]));
		}
	}
	return masterCardDeck;
};

exports.shuffle = function (cardArr) {
	internalShuffle(cardArr);
	internalShuffle(cardArr);
};

var internalShuffle = function (cardArr) {
	var i = cardArr.length, j, tempi, tempj;
	if (i === 0)
		return false;
	while (--i) {
		j = Math.floor(Math.random() * (i + 1));
		tempi = cardArr[i];
		tempj = cardArr[j];
		cardArr[i] = tempj;
		cardArr[j] = tempi;
	}
};

exports.display =  function (cardArr) {
	for (var j = 0 ; j < cardArr.length; j++) {
		console.log("Card "+j+" : "+cardArr[j].rank.name+cardArr[j].suit.name);
	}
};

exports.totalPoints  = function(cardArr, obj){
	var points = 0;
	for (var j = 0 ; j < cardArr.length; j++) {
		points += obj[this.cardArr[j].rank.name];
	}
	return points;
};
