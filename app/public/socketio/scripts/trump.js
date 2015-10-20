$(document).ready(function() {

});

function trump($scope) {
	userInfo = {user:user, site:site, room:room , session:session, total:total, view:view};
	events = {
		message:"message", welcome:"welcome", playerJoin:"player-join",
		playerLeave:"player-leave", cards:"cards", play:"play",
		round:"round", game:"game", ready:"ready", addComputer:"add-computer"
	};
	socket = io.connect();
	$scope.suitImg = {
		"C": {bgPos:[222, 0]},
		"S": {bgPos:[111, -111]},
		"H": {bgPos:[111, 0]},
		"D": {bgPos:[222, -111]},
		"L": {bgPos:[111, -333]},
		"A": {bgPos:[222, -333]},
		"R": {bgPos:[222, -444]},
		"-": {bgPos:[111, -444]}
	};
	$scope.cardBackArr = [
		{name:"CB1", index:0, bgPos:[999, -888], valid:false},
		{name:"CB2", index:0, bgPos:[777, -888], valid:false},
		{name:"CB3", index:0, bgPos:[555, -888], valid:false},
		{name:"CB4", index:0, bgPos:[333, -888], valid:false},
		{name:"CB5", index:0, bgPos:[111, -888], valid:false},
		{name:"CB6", index:0, bgPos:[888, -1036], valid:false}
	];

	$scope.starter = -1;
	$scope.position = -100;
	$scope.message = '';
	$scope.connected = false;
	$scope.messageArr = [];
	$scope.cards = [];
	$scope.token = -1;
	$scope.oldBidObj = null;
	var joker = {name:"JOKER", index:0, bgPos:[777, -888], valid:false};
	$scope.blank = {name:"$scope.blank", index:0, bgPos:[222, 0], valid:false};
	$scope.cardBack = joker;
	$scope.trump = {card:null, setter:-1, points:0, revealed:false, index:-1};
	$scope.tableData = {players : [], round :[], prevRound:[], bidData:[], prevGame:{stats:null, allRounds:[]}};
	$scope.bidOver = false;
	var defaultInfo = 'Welcome';
	$scope.info = defaultInfo;

	$scope.roundOver = function (data) {
		//$scope.addMessage(data.message, data.sender, data.date, data.data);
		$scope.tableData.prevRound = data.data.prevRound;
		$scope.starter = data.data.winner.player;
		$scope.setDefaultBg(1);
		//$scope.addControlData(events.round, data.data);
		$scope.$apply();
	};

	$scope.gameOver = function (data) {
		//$scope.addMessage(data.message, data.sender, data.date, data.data);
		$scope.starter = -1;
		$scope.trump.card = null;
		$scope.trump.setter = -1;
		$scope.trump.points = 0;
		$scope.trump.revealed = false;
		$scope.bidOver = false;
		$scope.setDefaultBg(0);
		$scope.tableData.prevRound = [];
		$scope.tableData.prevGame.allRounds = data.data.prevGame.allRounds;
		$scope.tableData.prevGame.stats = data.data.prevGame.stats;
		//$scope.addControlData(events.game, data.data);
		$("#prev-game").modal();
		$scope.$apply(function () {
		});
	};
	$scope.bidObj = {
		bid:false,
		bidder:0,
		points:0,
		minimum:false,
		increaseBid : function() {
			if ($scope.bidObj.bid && $scope.token == $scope.position) {
				$scope.bidObj.points++;
			}
		},
		decreaseBid: function() {
			if ($scope.bidObj.bid && $scope.token == $scope.position) {
				$scope.bidObj.points--;
			}
		},
		submitBid: function() {
			if ($scope.bidObj.bid && $scope.token == $scope.position) {
				if ($scope.bidObj.points <= $scope.oldBidObj.points) {
					if ($scope.bidObj.points < $scope.oldBidObj.points) {
						$scope.info ='Cannot bid equal or lesser';
						return;
					} else {
						if ($scope.bidObj.minimum !== true) {
							$scope.info ='Cannot bid equal or lesser';
							return;
						}
					}
				}
				$scope.action = "Wait";
				$scope.bidObj.minimum = false;
				socket.emit(events.play, {userInfo: userInfo, play:false, player:$scope.position, trump:null, bidObj:$scope.bidObj});
			}
		},
		passBid: function() {
			if ($scope.bidObj.bid && $scope.token == $scope.position) {
				if ($scope.bidObj.minimum === true) {
					$scope.info ='Cannot pass the minimum bid';
					return;
				}
				$scope.action = "Wait";
				socket.emit(events.play, {userInfo: userInfo, play:false, pass:true, player:$scope.position, trump:null, bidObj:$scope.oldBidObj});
			}
		}
	};

	socket.on('connect', function() {
		// Connected, let's sign-up for to receive messages for this room
		socket.emit('setPseudo', {userInfo: userInfo});
	});
	socket.on(events.welcome, function(data) {
		//$scope.addMessage(data.message, data.sender, data.date, data.data);
		$scope.connected = true;
		//$scope.addControlData(events.welcome, data.data);
		for (var i = 0; i< data.data.length; i++) {
			if (data.data[i] == user) {
				$scope.position = i;
				break;
			}
		}
		socket.on(events.playerJoin, function(data) {
			$scope.info = data.message;
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.addControlData(events.playerJoin, data.data);
			if (data.data.inProgress) {
				$scope.tableData.players[$scope.shifter(data.data.position)] = data.data.name;
			}
			$scope.$apply();
		});
		socket.on(events.playerLeave, function(data) {
			$scope.info = data.message;
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.addControlData(events.playerLeave, data.data);
			if (data.data.inProgress) {
				$scope.tableData.players[$scope.shifter(data.data.position)] = data.data.name;
			}
			$scope.$apply();
		});
		socket.on(events.round, function(data) {
			$scope.roundOver(data);
		});
		socket.on(events.game, function(data) {
			$scope.gameOver(data);
		});
		socket.on(events.ready, function(data) {
			var i = 0;
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			//$scope.addControlData(events.ready, data.data);
			if ($scope.position >= 0) {
				$scope.tableData.players = data.data.players.concat(data.data.players.splice(0, $scope.position));
				$scope.tableData.players[$scope.shifter($scope.position)] = "You";
				//$scope.tableData.players[$scope.position] = "You ("+$scope.tableData.players[$scope.position]+")";
			} else {
				$scope.tableData.players = data.data.players;
			}
			for (i = 0; i< $scope.tableData.players.length ; i++) {
				if (data.data.round) {
					$scope.tableData.round[i] = $scope.cardBack;
				} else {
					$scope.tableData.round[i] = $scope.blank;
				}
				$scope.tableData.bidData[i] = '';
			}
			if (data.data.round) {
				for (i = 0; i< data.data.round.length ; i++) {
					$scope.tableData.round[$scope.shifter(data.data.round[i].player)] = data.data.round[i].card;
				}
				$scope.starter = data.data.round[0].player;
				$scope.token = (data.data.round[data.data.round.length - 1].player + 1 ) % total;
			}
			if (data.data.bidData) {
				for (i = 0; i< data.data.bidData.length ; i++) {
					$scope.tableData.bidData[$scope.shifter(data.data.bidData[i][0])] = data.data.bidData[i][1];
				}
			}
			if (data.data.trumpData && data.data.trumpData.setter != -1) {
				$scope.trump.setter = data.data.trumpData.setter;
				$scope.trump.points = data.data.trumpData.points;
				$scope.trump.revealed = data.data.trumpData.revealed;
				if ($scope.trump.revealed === true) {
					$scope.trump.card = data.data.trumpData.card;
				} else {
					$scope.trump.card = $scope.cardBack;
				}
			}
			$scope.action = "Wait";
			$scope.info = "Wait";
			$scope.$apply();
		});
		socket.on(events.cards, function(data) {
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.cards = $scope.cards.concat(data.data.cards);
			//$scope.addControlData(events.cards, data.data);
			$scope.$apply();
		});
		socket.on(events.play, function(data) {
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			//$scope.addControlData(events.play, data.data);
			$scope.token = data.data.player;
			if (data.data.play) {
				$scope.playFunction(data);
			} else {
				$scope.bidFunction(data);
			}
			$scope.$apply();
		});
		$scope.currentPrevGameSlide = -1;
		$scope.carouselFunc = function() {
			$("#myCarousel").carousel({interval: false});
			$("#myCarousel").on('slide.bs.carousel', function(e) {
				var slideFrom = $(this).find('.active').index();
				$scope.currentPrevGameSlide = $(e.relatedTarget).index();
				$scope.$apply();
			});
		}();
		for (i = 1 ; i < total; i++) {
			$scope.addComputer(0);
		}
	});
	socket.on(events.message, function(data) {
		$scope.addMessage(data.message, data.sender, data.date, data.data);
	});
	socket.on('disconnect', function(data) {
		window.location.reload(true);
	});
	$scope.playFunction = function (data) {
		var i , j , k = 0;
		if ($scope.position >= 0) {
			$scope.info = data.message;
		}
		if ($scope.token !== $scope.position && $scope.token >= 0) {
			$scope.info = $scope.tableData.players[$scope.shifter($scope.token)] + "'s turn";
		}
		if (data.data.cardObj) {
			if (data.data.cardObj.player == $scope.position) {
				$scope.cards.splice(data.data.cardObj.index, 1);
				for (j = 0; j < $scope.cards.length; j++) {
					$scope.cards[j].valid = false;
				}
			}
			$scope.tableData.round[$scope.shifter(data.data.cardObj.player)] = data.data.cardObj.card;
			$scope.addControlData("PLAYER:", data.data.cardObj.player);
			$scope.addControlData("SHIFTER", $scope.shifter(data.data.cardObj.player));
		}
		if (data.data.reveal && data.data.reveal === true) {
			if (data.data.card !== null) {
				$scope.trump.revealed = true;
				$scope.trump.card = data.data.card;
				if ($scope.token == $scope.position) {
					$scope.info = "Trump Revealed by you";
					for (j = 0; j < $scope.cards.length; j++) {
						$scope.cards[j].valid = false;
					}
				}
				if ($scope.trump.setter == $scope.position) {
					for (i = 0; i < $scope.cards.length; i++) {
						if ($scope.cards[i].name == $scope.cardBack.name) {
							$scope.cards[i] = $scope.trump.card;
							break;
						}
					}
				}
			}
		}
		if ($scope.token === $scope.position) {
			if (data.data.validCards) {
				for (k = 0; k < data.data.validCards.cards.length; k++) {
					$scope.cards[data.data.validCards.cards[k]].valid = true;
				}
				$scope.canReveal = data.data.validCards.canReveal;
				$scope.addControlData(events.ready, data.data.validCards.cards);
			}
			if (data.message == "PLAY") {
				$scope.info = "Your turn";
			}
			$scope.action = "Play";
		} else {
			$scope.action = $scope.tableData.players[$scope.shifter($scope.token)] + "'s turn";
		}

	};
	$scope.bidFunction = function (data) {
		var j = 0;
		$scope.oldBidObj = data.data.bidObj;
		$scope.bidObj.bid = data.data.bidObj.bid;
		$scope.bidObj.bidder = data.data.bidObj.bidder;
		$scope.bidObj.points = data.data.bidObj.points;
		$scope.bidObj.minimum = data.data.bidObj.minimum;
		if (data.data.bidObj.bid && $scope.token === $scope.position) {
			$scope.action = "Bid";
			for (j = 0; j < $scope.cards.length; j++) {
				$scope.cards[j].valid = true;
			}
		} else {
			$scope.action = "Wait";
			for (j = 0; j < $scope.cards.length; j++) {
				$scope.cards[j].valid = false;
			}
		}

		//Setting trump for the first time
		if ($scope.bidObj.bid === false) {
			if($scope.position === data.data.player) {
				for (j = 0; j < $scope.cards.length; j++) {
					$scope.cards[j].valid = true;
				}
				$scope.action = "Set Trump";
				$scope.info = "Set Trump";
			}
			if (data.data.bidObj.trump === true) {
				$scope.trump.setter = data.data.bidObj.bidder;
				$scope.addControlData(events.play, data.data);
				if ($scope.trump.setter !== $scope.position)
					$scope.trump.card = $scope.cardBack;
				else
					$scope.trump.card = $scope.cards[data.data.bidObj.index];
				$scope.trump.points = data.data.bidObj.points;
				$scope.clearBidData();
				if (data.data.bidObj.round == 2) {
					$scope.bidOver = true;
					$scope.setDefaultBg(1);
					if ($scope.trump.setter === $scope.position) {
						$scope.cards[data.data.bidObj.index] = $scope.cardBack;
					}
					for (j = 0; j < $scope.cards.length; j++) {
						$scope.cards[j].valid = false;
					}
				}
			}else {
				var value = data.data.bidObj.points;
				if (data.data.pass === true) {
					value = '-';
				}
				$scope.tableData.bidData[$scope.shifter(data.data.bidObj.bidder)] = value;
			}
		}

	};
	$scope.clearBidData = function () {
		for (var i = 0; i< $scope.tableData.bidData.length ; i++) {
			$scope.tableData.bidData[i] = '';
		}
	};
	$scope.setDefaultBg = function (option) {
		var card = null;
		if (option === 0)
			card = $scope.blank;
		else
			card = $scope.cardBack;
		for (var i = 0; i< $scope.tableData.round.length ; i++) {
			$scope.tableData.round[i] = card;
		}
	};
	$scope.addMessage = function (msg, sender, date, data) {
		if (data.error) {
			$scope.info = msg;
			$scope.$apply();
		}
		$("#ccbox").append("<p class=small><span class=date>"+date+" : </span><span class=sender>"+sender+" : </span><span class=message>"+msg+"</span></p>");
		$('#ccbox').scrollTop($("#ccbox").prop('scrollHeight'));
	};
	$scope.addControlData = function (event, data) {
		$("#control-data").append(event+" : "+JSON.stringify(data));
	};
	$scope.addComputer = function(difficulty) {
		socket.emit(events.addComputer, {userInfo: userInfo, difficulty: difficulty});
	};
	$scope.sendMessage = function() {
		if ($scope.message !== "") {
			socket.emit(events.message, $scope.message);
			$scope.addMessage($scope.message, "Me : ", new Date().toLocaleString(), null);
			$scope.message = '';
		} else {
			socket.emit('event1', {});
		}
	};
	$scope.cardClick = function (card, index) {
		if ($scope.action == "Set Trump") {
			socket.emit(events.play, {play:false, trump:card, userInfo:userInfo, bidObj:$scope.oldBidObj});
			$scope.trump.card = card;
			$scope.action = "Wait";
		}
		if ($scope.token == $scope.position && $scope.action == "Play") {
			if (card.name == $scope.blank.name || card.name == $scope.cardBack.name) {
				$scope.info = "Cannot play closed card";
				return;
			}
			/*
			if (card.valid !== true) {
				$scope.info = "Not a valid card";
			}
			*/
			//$("#control-data").append("Click : "+card.name);
			socket.emit(events.play, {play:true, userInfo:userInfo, player:$scope.position, cardObj:{card:card, player:$scope.position, index:index}});
			$scope.action = "Wait";
		}
	};
	$scope.revealTrump = function () {
		if ($scope.token == $scope.position && $scope.action == "Play") {
			socket.emit(events.play, {play:true, userInfo:userInfo, player:$scope.position, reveal:true});
			$scope.action = "Wait";
		}
	};
	$scope.changeCardBack = function (option) {
		$scope.cardBack.bgPos = $scope.cardBackArr[option].bgPos;
		$scope.$apply();
	};
	$scope.shifter = function (number) {
		return (total + number - $scope.position ) % total;
	};
}

function spades ($scope) {
	trump.call(this, $scope);
}

spades.prototype = Object.create(trump.prototype);

function hearts ($scope) {
	$scope.passOver = false;
	$scope.firstHearts = false;
	$scope.passCards = [];
	$scope.submitPass = function() {
		if ($scope.token == $scope.position && $scope.action == "Pass" ){
			if ($scope.passCards.length == 3) {
				socket.emit(events.play, {play:false, userInfo:userInfo, player:$scope.position, passCards:$scope.passCards});
				$scope.action = "Wait";
				$scope.cards[$scope.passCards[0]].valid = false;
				$scope.cards[$scope.passCards[1]].valid = false;
				$scope.cards[$scope.passCards[2]].valid = false;
				passSent = true;
			} else {
				$scope.info = "Please select 3 cards to Pass";
			}
		}
	};

	trump.call(this, $scope);

	var passArr = ["L", "A", "R", "-"];
	var passSent = false;

	$scope.roundOver = function(data){
		//$scope.addMessage(data.message, data.sender, data.date, data.data);
		$scope.tableData.prevRound = data.data.prevRound;
		$scope.starter = data.data.winner.player;
		$scope.setDefaultBg(1);
		//$scope.addControlData(events.round, data.data);
		$scope.$apply();

	};
	$scope.gameOver = function(data){
		//$scope.addMessage(data.message, data.sender, data.date, data.data);
		$scope.starter = -1;
		$scope.passOver = false;
		$scope.firstHearts = false;
		$scope.setDefaultBg(1);
		$scope.tableData.prevRound = [];
		$scope.tableData.prevGame = data.data.prevGame;
		//$scope.addControlData(events.game, data.data);
		$scope.$apply();
	};
	$scope.bgIcon = "L";

	$scope.playFunction = function (data) {
		if ($scope.position >= 0) {
			$scope.info = data.message;
		}
		if (data.data.cardObj) {
			if (data.data.cardObj.player == $scope.position) {
				$scope.cards.splice(data.data.cardObj.index, 1);
			}
			$scope.tableData.round[$scope.shifter(data.data.cardObj.player)] = data.data.cardObj.card;
		}
		if (data.data.reveal && data.data.reveal === true) {
		}
		if ($scope.token === $scope.position) {
			$scope.action = "Play";
		} else {
			$scope.action = "Wait";
		}

	};
	$scope.bidFunction = function (data) {
		if (data.data.passOver && data.data.passOver === true) {
			$scope.passOver = true;
			passSent = false;
			if (data.data.cards) {
				for (var i = 0; i < $scope.passCards.length; i++) {
					$scope.cards[$scope.passCards[i]] = data.data.cards[i];
				}
			}
			$scope.passCards.splice(0, 3);
			return;
		}
		if ($scope.token == $scope.position) {
			$scope.action = "Pass";
		} else {
			$scope.action = "Wait";
		}
		if (data.data.game !== undefined) {
			$scope.addControlData("Pass", data.data.game);
			$scope.bgIcon = passArr[data.data.game];
		}
		$scope.setDefaultBg(1);
		$scope.$apply();
	};
	$scope.cardClick = function (card, index) {
		if ($scope.passOver === false && passSent === false) {
			var cardFound = $.inArray(index, $scope.passCards);
			if (cardFound == -1) {
				if ($scope.passCards.length == 3) {
					$scope.info = "Select only 3 cards";
					return;
				}
				card.valid = true;
				$scope.passCards.push(index);
			} else {
				card.valid = false;
				$scope.passCards.splice(cardFound, 1);
			}
			//$scope.addControlData(events.welcome, $scope.passCards);
			return;
		}
		if ($scope.token == $scope.position && $scope.action == "Play") {
			if (card.name == $scope.blank.name || card.name == $scope.cardBack.name) {
				$scope.info = "Cannot play closed card";
				return;
			}
			//$("#control-data").append("Click : "+card.name);
			socket.emit(events.play, {play:true, userInfo:userInfo, player:$scope.position, cardObj:{card:card, player:$scope.position, index:index}});
			$scope.action = "Wait";
		}
	};
}
hearts.prototype = Object.create(trump.prototype);
