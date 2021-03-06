$(document).ready(function() {
	//$.circleProgress.defaults.animation.duration = 5000;
	$.circleProgress.defaults.animation.easing = "linear";
});
var REPLACE_COMPUTER_SPECIFIC = 0, REPLACE_COMPUTER_ANY = 1, CHANGE_DIFFICULTY = 2;
var DIFFICULTY_EASY = 0, DIFFICULTY_MEDIUM = 1, DIFFICULTY_HARD = 2;
var userImgWidth = 80;
var thickness = 5;

function trump($scope) {
	var socket = io.connect();
	$scope.alreadyWelcomed = false;
	$scope.timerSeconds = '';
	$scope.minTimerDisplay = 4;

	$scope.events = {
		message:"message", welcome:"welcome", playerJoin:"player-join",
		playerLeave:"player-leave", cards:"cards", play:"play",
		round:"round", game:"game", ready:"ready", changeComputer:"change-computer",
		playerChange:"player-change",
		setPseudo: "setPseudo",
		timer:"timer"
	};

	$scope.emitEvent = function (evt, data) {
		data.userInfo = $scope.roomInfo;
		socket.emit(evt, data);
	};

	$scope.tableColors = [
		__metro_yellow,
		__metro_jade,
		__metro_cyan,
		__metro_red,
		__metro_navy,
		__metro_green,
		__metro_teal,
		__metro_pink
	];

	$scope.roomInfo = {
		user:infoUser,
		site:infoSite,
		room:infoRoom,
		session:infoSession,
		total:infoTotal,
		view:infoView
	};

	$scope.suitImg = {
		"C": {bgPos:[222, 0]},
		"S": {bgPos:[111, -111]},
		"H": {bgPos:[111, 0]},
		"D": {bgPos:[222, -111]},
		"L": {bgPos:[111, -333]},
		"A": {bgPos:[222, -333]},
		"R": {bgPos:[222, -444]},
		"T": {bgPos:[222, -222]},
		"-": {bgPos:[111, -444]}
	};
	$scope.cardBackArr = [
		{name:"CB1", index:0, bgPos:[999, -888], valid:false},
		{name:"CB2", index:0, bgPos:[777, -888], valid:false},
		{name:"CB3", index:0, bgPos:[555, -888], valid:false},
		{name:"CB4", index:0, bgPos:[333, -888], valid:false},
		{name:"CB5", index:0, bgPos:[111, -888], valid:false},
		{name:"CB6", index:0, bgPos:[888, -1036], valid:false},
		{name:"CB7", index:0, bgPos:[666, -1036], valid:false}
	];

	$scope.starter = -1;
	$scope.position = -48;
	$scope.message = '';
	$scope.connected = false;
	$scope.messageArr = [];
	$scope.cards = [];
	$scope.token = -1;
	$scope.oldBidObj = null;
	var joker = {name:"JOKER", index:0, bgPos:[111, -888], valid:false};
	$scope.blank = {name:"$scope.blank", index:0, bgPos:[222, 0], valid:false};
	$scope.cardBack = joker;
	$scope.trump = {card:null, setter:-1, points:0, revealed:false, index:-1};
	$scope.tableData = {players : [], playerDetails:[], round :[], prevRound:[], bidData:[], prevGame:{stats:null, allRounds:[]}};
	$scope.bidOver = false;
	var defaultInfo = 'Welcome';
	$scope.info = defaultInfo;
	$scope.roundOver = function (data) {
		//$scope.addMessage(data.message, data.sender, data.date, data.data);
		$scope.tableData.prevRound = data.data.prevRound;
		$scope.starter = data.data.winner.player;
		$scope.setDefaultBg(1);
		//$scope.addControlData($scope.events.round, data.data);
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
		//$scope.addControlData($scope.events.game, data.data);
	};
	$scope.bidObj = {
		bid:false,
		bidder:0,
		points:0,
		minimum:false,
		increaseBid : function() {
			if ($scope.bidObj.bid && $scope.token == $scope.position && $scope.bidObj.points !== "00") {
				$scope.bidObj.points++;
			}
		},
		decreaseBid: function() {
			if ($scope.bidObj.bid && $scope.token == $scope.position && $scope.bidObj.points != "00") {
				$scope.bidObj.points--;
			}
		},
		submitBid: function() {
			if ($scope.bidObj.bid && $scope.token == $scope.position) {
				//if ($scope.bidObj.points <= $scope.oldBidObj.points) {
					//if ($scope.bidObj.points < $scope.oldBidObj.points) {
						//$scope.info ='Cannot bid equal or lesser';
						//return;
					//} else {
						//if ($scope.bidObj.minimum !== true) {
							//$scope.info ='Cannot bid equal or lesser';
							//return;
						//}
					//}
				//}
				$scope.action = "Wait";
				$scope.bidObj.minimum = false;
				$scope.emitEvent($scope.events.play, {play:false, pass:false, player:$scope.position, trump:null, bidObj:$scope.bidObj});
			}
		},
		passBid: function() {
			if ($scope.bidObj.bid && $scope.token == $scope.position) {
				if ($scope.bidObj.minimum === true) {
					$scope.info ='Cannot pass the minimum bid';
					return;
				}
				$scope.action = "Wait";
				$scope.emitEvent($scope.events.play, {play:false, pass:true, player:$scope.position, trump:null, bidObj:$scope.oldBidObj});
			}
		}
	};

	socket.on('connect', function() {
		// Connected, let's sign-up for to receive messages for this room
		$scope.emitEvent($scope.events.setPseudo, {});
	});
	socket.on($scope.events.welcome, function(data) {
		//$scope.addMessage(data.message, data.sender, data.date, data.data);
		$scope.connected = true;
		//$scope.addControlData($scope.events.welcome, data.data);
		var playerArr = data.data;
		for (var i = 0; i< playerArr.length; i++) {
			if (playerArr[i] == $scope.roomInfo.user) {
				$scope.position = i;
				$scope.roomInfo.view = false;
				break;
			}
		}
		if ($scope.alreadyWelcomed === true) {
			return;
		}

		$scope.onPlayerChange = function (data) {
			$scope.info = data.message;
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			//$scope.addControlData(data.event, data.data);
			if (data.data.inProgress) {
				$scope.tableData.players[$scope.shifter(data.data.position)] = data.data.name;
				$scope.tableData.playerDetails[$scope.shifter(data.data.position)] = data.data.details;
			}
			$scope.$apply();
		};

		socket.on($scope.events.playerChange, $scope.onPlayerChange);
		socket.on($scope.events.playerJoin, $scope.onPlayerChange);
		socket.on($scope.events.playerLeave, $scope.onPlayerChange);

		/*
		socket.on($scope.events.playerJoin, function(data) {
			$scope.info = data.message;
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.addControlData($scope.events.playerJoin, data.data);
			if (data.data.inProgress) {
				$scope.tableData.players[$scope.shifter(data.data.position)] = data.data.name;
				$scope.tableData.playerDetails[$scope.shifter(data.data.position)] = data.data.details;
			}
			$scope.$apply();
		});

		socket.on($scope.events.playerLeave, function(data) {
			$scope.info = data.message;
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.addControlData($scope.events.playerLeave, data.data);
			if (data.data.inProgress) {
				$scope.tableData.players[$scope.shifter(data.data.position)] = data.data.name;
				$scope.tableData.playerDetails[$scope.shifter(data.data.position)] = data.data.details;
			}
			$scope.$apply();
		});
	   */

		socket.on($scope.events.round, function(data) {
			$scope.roundOver(data);
		});

		socket.on($scope.events.game, function(data) {
			$scope.gameOver(data);
			$("#prev-game").modal();
			$scope.$apply();
			setTimeout(function () {
				$("#prev-game").modal('hide');
			}, 4000);
		});

		socket.on($scope.events.ready, function(data) {
			var i = 0;
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.addControlData($scope.events.ready, data.data);
			if ($scope.position >= 0) {
				$scope.tableData.players = data.data.players.concat(data.data.players.splice(0, $scope.position));
				$scope.tableData.players[$scope.shifter($scope.position)] = "You";
				//$scope.tableData.players[$scope.position] = "You ("+$scope.tableData.players[$scope.position]+")";
				if (data.data.details) {
					$scope.tableData.playerDetails = data.data.details.concat(data.data.details.splice(0, $scope.position));
				}
			} else {
				$scope.tableData.players = data.data.players;
				if (data.data.details) {
					$scope.tableData.playerDetails = data.data.details;
				}
			}
			for (i = 0; i< $scope.tableData.players.length ; i++) {
				if (data.data.round) {
					$scope.tableData.round[i] = $scope.blank;
					//$scope.tableData.round[i] = $scope.cardBack;
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
				$scope.token = (data.data.round[data.data.round.length - 1].player + 1 ) % $scope.roomInfo.total;
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
				if (data.data.trumpData.card) {
					$scope.trump.card = data.data.trumpData.card;
				} else {
					$scope.trump.card = $scope.cardBack;
				}
			}
			$scope.action = "Wait";
			$scope.info = "Wait";
			$scope.$apply();
		});
		socket.on($scope.events.cards, function(data) {
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.cards = $scope.cards.concat(data.data.cards);
			if ($scope.trump.setter == $scope.position) {
				for (i = 0; i < $scope.cards.length; i++) {
					if ($scope.trump.card.name == $scope.cards[i].name) {
						$scope.cards[i] = $scope.cardBack;
					}
				}
			}
			$scope.addControlData($scope.events.cards, data.data);
			$scope.$apply();
		});
		socket.on($scope.events.timer, function(data) {
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			var timerPlayer = data.data.player;
			var id = "#playtimer-"+$scope.shifter(timerPlayer);
			var timeOut = data.data.timeOut;
			$scope.timerSeconds = parseInt(timeOut/1000, 10);
			//$scope.addControlData($scope.events.timer, {id:id, timeOut:timeOut, player:timerPlayer, seconds:$scope.timerSeconds, position:$scope.position, index:$scope.shifter(timerPlayer)});
			$(id).circleProgress({
				value: 1.0,
				size:userImgWidth,
				thickness:thickness,
				fill : {gradient: [$scope.tableColors[$scope.shifter(timerPlayer)], "#efefef"]},
				animation: { duration: timeOut}
			}).on('circle-animation-progress', function(event, progress) {
				var curTimer = 0;
				if (timerPlayer && timerPlayer != $scope.token) {
					$(this).circleProgress({value:1.0, animation:false, fill : {gradient: [$scope.tableColors[$scope.shifter(timerPlayer)], "#efefef"]}});
					$scope.timerSeconds= '';
				}
				curTimer = Math.ceil(timeOut/1000 * (1.0 - progress));
				if (curTimer != $scope.timerSeconds) {
					$scope.timerSeconds = curTimer;
					$scope.$digest();
				}
				//$(this).find('strong').html(parseInt(100 * progress) + '<i>%</i>');
			}).on('circle-animation-end', function(event) {
				$(this).off('circle-animation-progress');
				$scope.timerSeconds= '';
				//$(this).circleProgress({value:1.0, animation:false, fill: {gradient: [$scope.tableColors[$scope.shifter(timerPlayer)], "#efefef"]}});
				//var canvas = $(this).find('canvas')[0];
				//var context = canvas.getContext('2d');
				//context.clearRect(0, 0, canvas.width, canvas.height);
			});
		});
		socket.on($scope.events.play, function(data) {
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			//$scope.addControlData($scope.events.play, data.data);
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
		$scope.alreadyWelcomed = true;
	});
	socket.on($scope.events.message, function(data) {
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
		if (data.data.cardObj && data.data.cardObj.card) {
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
				$scope.addControlData($scope.events.ready, data.data.validCards.cards);
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
			$scope.info = "Bid";
			$scope.tableData.bidData[$scope.shifter($scope.token)] = ' ';
			for (j = 0; j < $scope.cards.length; j++) {
				$scope.cards[j].valid = true;
			}
		} else {
			$scope.action = "Wait";
			$scope.info = "Wait";
			for (j = 0; j < $scope.cards.length; j++) {
				$scope.cards[j].valid = true;
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
				$scope.addControlData($scope.events.play, data.data);
				if ($scope.trump.setter !== $scope.position) {
					$scope.trump.card = $scope.cardBack;
				} else {
					$scope.trump.card = $scope.cards[data.data.bidObj.index];
				}
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
			} else {
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
		//if (option === 0)
			//card = $scope.blank;
		//else
			//card = $scope.cardBack;
		card = $scope.blank;
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
		$("#control-data").append(event+" : "+JSON.stringify(data)+'<br/>');
	};

	$scope.replaceComputer = function(index) {
		$scope.emitEvent($scope.events.changeComputer, {mode:REPLACE_COMPUTER_SPECIFIC, difficulty:0, position:index});
	};

	$scope.changeDifficulty = function(index, difficulty) {
		$scope.emitEvent($scope.events.changeComputer, {mode:CHANGE_DIFFICULTY, difficulty:difficulty, position:index});
	};

	$scope.sendMessage = function() {
		if ($scope.message !== "") {
			socket.emit($scope.events.message, $scope.message);
			$scope.addMessage($scope.message, "Me : ", new Date().toLocaleString(), null);
			$scope.message = '';
		} else {
			socket.emit('event1', {});
		}
	};
	$scope.cardClick = function (card, index) {
		if ($scope.action == "Set Trump") {
			$scope.emitEvent($scope.events.play, {play:false, trump:card, bidObj:$scope.oldBidObj});
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
			$scope.emitEvent($scope.events.play, {play:true, player:$scope.position, cardObj:{card:card, player:$scope.position, index:index}});
			$scope.action = "Wait";
		}
	};
	$scope.revealTrump = function () {
		if ($scope.token == $scope.position && $scope.action == "Play") {
			$scope.emitEvent($scope.events.play, {play:true, player:$scope.position, reveal:true});
			$scope.action = "Wait";
		}
	};
	$scope.changeCardBack = function (option) {
		$scope.cardBack.bgPos = $scope.cardBackArr[option].bgPos;
		$scope.$apply();
	};
	$scope.shifter = function (number) {
		return ($scope.roomInfo.total + number - $scope.position ) % $scope.roomInfo.total;
	};
	$scope.centerObj = {
		suitObj : {
			show: function () {
				return ($scope.trump.revealed === true);
			},
			suit: function () {
				if ($scope.trump.card && $scope.trump.card.name != $scope.cardBack.name) {
					return $scope.suitImg[$scope.trump.card.suit.name];
				} else {
					return $scope.suitImg['-'];
				}
			}
		},
		clickObj : {
			hide: function () {
				return ($scope.trump.revealed || $scope.action != "Play" || $scope.canReveal !== true);
			},
			suit: function () {
				return $scope.suitImg.T;
			},
			click: $scope.revealTrump
		}
	};

	$scope.setCardClassObj = {
		yourTurn : function () {
			return ($scope.action == 'Play' || $scope.action == 'Bid' || $scope.action == 'Set Trump');
		},
		highlight : function(card) {
			return (card.valid === true);
		},
		clicked : function (card) {
			return false;
		}
	};
}

function spades ($scope) {
	trump.call(this, $scope);
	$scope.centerObj = {
		suitObj : {
			show: function () {
				return ($scope.trump.revealed === true);
			},
			suit: function () {
				return $scope.suitImg.S;
			}
		},
		clickObj : {
			hide: function () {
				return true;
			},
			suit: function () {
				return $scope.suitImg.S;
			},
			click: function () {

			}
		}
	};
}

spades.prototype = Object.create(trump.prototype);

function hearts ($scope) {
	$scope.passOver = false;
	$scope.firstHearts = false;
	$scope.passCards = [];
	$scope.submitPass = function() {
		if ($scope.token == $scope.position && $scope.action == "Pass" ){
			if ($scope.passCards.length == 3) {
				$scope.emitEvent($scope.events.play, {play:false, player:$scope.position, passCards:$scope.passCards});
				$scope.action = "Wait";
				$scope.cards[$scope.passCards[0]].valid = false;
				$scope.cards[$scope.passCards[1]].valid = false;
				$scope.cards[$scope.passCards[2]].valid = false;
				$scope.passSent = true;
			} else {
				$scope.info = "Select 3 cards to pass";
			}
		}
	};

	trump.call(this, $scope);

	var passArr = ["L", "A", "R", "-"];
	$scope.passSent = false;

	$scope.gameOver = function(data){
		//$scope.addMessage(data.message, data.sender, data.date, data.data);
		$scope.starter = -1;
		$scope.passOver = false;
		$scope.firstHearts = false;
		$scope.setDefaultBg(1);
		$scope.tableData.prevRound = [];
		$scope.tableData.prevGame = data.data.prevGame;
		//$scope.addControlData($scope.events.game, data.data);
	};
	$scope.bgIcon = "L";

	$scope.playFunction = function (data) {
		var j;
		if ($scope.position >= 0) {
			$scope.info = data.message;
		}
		if (data.data.cardObj) {
			if (data.data.cardObj.player == $scope.position) {
				$scope.cards.splice(data.data.cardObj.index, 1);
			}
			for (j = 0; j < $scope.cards.length; j++) {
				$scope.cards[j].valid = false;
			}
			$scope.tableData.round[$scope.shifter(data.data.cardObj.player)] = data.data.cardObj.card;
		}
		if ($scope.token === $scope.position) {
			if (data.data.validCards) {
				for (j = 0; j < data.data.validCards.cards.length; j++) {
					$scope.cards[data.data.validCards.cards[j]].valid = true;
				}
				$scope.addControlData($scope.events.ready, data.data.validCards.cards);
			}
			$scope.action = "Play";
		} else {
			$scope.action = "Wait";
		}
		$scope.$apply();
	};

	$scope.bidFunction = function (data) {
		var i, temp;
		if (data.data.game !== undefined) {
			$scope.addControlData("Pass", data.data.game);
			$scope.bgIcon = passArr[data.data.game];
		}
		if (data.data.passOver && data.data.passOver === true) {
			$scope.passOver = true;
			$scope.passSent = false;
			if (data.data.cards && data.data.cardIndexArr) {
				var cardIndexArr = data.data.cardIndexArr;
				for (i = 0; i < cardIndexArr.length; i++) {
					$scope.cards[cardIndexArr[i]] = data.data.cards[i];
				}
			}
			$scope.passCards.splice(0, 3);
			return;
		}
		if ($scope.token === $scope.position) {
			$scope.action = "Pass";
		} else {
			$scope.action = "Wait";
		}
		$scope.setDefaultBg(1);
	};
	$scope.cardClick = function (card, index) {
		if ($scope.passOver === false && $scope.passSent === false) {
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
			//$scope.addControlData($scope.events.welcome, $scope.passCards);
			return;
		}
		if ($scope.token == $scope.position && $scope.action == "Play") {
			if (card.name == $scope.blank.name || card.name == $scope.cardBack.name) {
				$scope.info = "Cannot play closed card";
				return;
			}
			//$("#control-data").append("Click : "+card.name);
			$scope.emitEvent($scope.events.play, {play:true, player:$scope.position, cardObj:{card:card, player:$scope.position, index:index}});
			$scope.action = "Wait";
		}
	};
	$scope.setCardClassObj = {
		yourTurn : function () {
			return ($scope.action == 'Pass' || $scope.action == 'Play');
		},
		highlight : function(card) {
			return ((card.valid === true && $scope.passOver === true) || $scope.passOver === false);
		},
		clicked : function (card) {
			return (card.valid === true && $scope.passOver === false);
		}
	};
	$scope.centerObj = {
		suitObj : {
			show: function () {
				return ($scope.firstHearts === true);
			},
			suit: function () {
				return $scope.suitImg.H;
			}
		},
		clickObj : {
			hide: function () {
				return ($scope.position != $scope.token || $scope.passOver === true);
			},
			suit: function () {
				return $scope.suitImg[$scope.bgIcon];
			},
			click: $scope.submitPass
		}
	};
}
hearts.prototype = Object.create(trump.prototype);

function ass($scope) {
	trump.call(this, $scope);
}
ass.prototype = Object.create(trump.prototype);

function test ($scope) {
	$scope.testclick = function () {
		var id = "#circle";
		$(id).circleProgress({
			value: 0.9,
			animation: {duration: 1200, easing: "circleProgressEase" }
		}).on('circle-animation-progress', function(event, progress) {
			$(this).find('strong').html(parseInt(100 * progress) + '<i>%</i>');
		});

	};
}
