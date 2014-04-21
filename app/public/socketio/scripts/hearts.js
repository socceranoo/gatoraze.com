$(document).ready(function() {
});

function Hearts($scope) {
	var events = {
		message:"message", welcome:"welcome", playerJoin:"player-join",
		playerLeave:"player-leave", cards:"cards", play:"play",
		round:"round", game:"game", ready:"ready", addComputer:"add-computer"
	};
	var passArr = ["L", "A", "R", "-"];
	var passSent = false;
	$scope.bgIcon = "L";
	$scope.suitImg = {
		"C": {bgPos:[222, 0]},
		"S": {bgPos:[111, -111]},
		"H": {bgPos:[111, 0]},
		"D": {bgPos:[222, -111]},
		"L": {bgPos:[111, -333]},
		"A": {bgPos:[222, -333]},
		"R": {bgPos:[222, -444]},
		"-": {bgPos:[111, -444]},
	};
	$scope.cardBackArr = [
		{name:"CB1", index:0, bgPos:[999, -888], valid:false},
		{name:"CB2", index:0, bgPos:[777, -888], valid:false},
		{name:"CB3", index:0, bgPos:[555, -888], valid:false},
		{name:"CB4", index:0, bgPos:[333, -888], valid:false},
		{name:"CB5", index:0, bgPos:[111, -888], valid:false},
		{name:"CB6", index:0, bgPos:[888, -1036], valid:false}
	];
	var socket = io.connect();
	$scope.starter = -1;
	$scope.position = 0;
	$scope.message = '';
	$scope.connected = false;
	$scope.cards = [];
	$scope.token = -1;
	var joker = {name:"JOKER", index:0, bgPos:[777, -888], valid:false};
	var blank = {name:"BLANK", index:0, bgPos:[222, 0], valid:false};
	$scope.cardBack = joker;
	$scope.tableData = {players : [], round :[], prevRound:[], prevGame:[]};
	$scope.passOver = false;
	var defaultInfo = 'Welcome';
	$scope.info = defaultInfo;
	$scope.firstHearts = false;
	$scope.passCards = [];

	var userInfo = {user:user, site:site, room:room , session:session, total:total};

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
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.tableData.prevRound = data.data.prevRound;
			$scope.starter = data.data.winner.player;
			$scope.setDefaultBg(1);
			//$scope.addControlData(events.round, data.data);
			$scope.$apply();
		});
		socket.on(events.game, function(data) {
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.starter = -1;
			$scope.passOver = false;
			$scope.firstHearts = false;
			$scope.setDefaultBg(1);
			$scope.tableData.prevRound = [];
			$scope.tableData.prevGame = data.data.prevGame;
			//$scope.addControlData(events.game, data.data);
			$scope.$apply();
		});
		socket.on(events.ready, function(data) {
			var i = 0;
			$scope.tableData.players = data.data.players.concat(data.data.players.splice(0, $scope.position));
			$scope.tableData.players[$scope.shifter($scope.position)] = "You";
			//$scope.tableData.players = data.data.players;
			//$scope.tableData.players[$scope.position] = "You";
			//$scope.tableData.players[$scope.position] = "You ("+$scope.tableData.players[$scope.position]+")";
			for (i = 0; i< $scope.tableData.players.length ; i++) {
				$scope.tableData.round[i] = $scope.cardBack;
			}
			if (data.data.round) {
				for (i = 0; i< data.data.round.length ; i++) {
					$scope.tableData.round[$scope.shifter(data.data.round[i].player)] = data.data.round[i].card;
				}
			}
			$scope.action = "Wait";
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
				$scope.passFunction(data);
			}
			$scope.$apply();
		});
		$("#myCarousel").carousel({interval: false});
		for (i = 1 ; i < total; i++)
			$scope.addComputer();
	});
	socket.on(events.message, function(data) {
		$scope.addMessage(data.message, data.sender, data.date, data.data);
	});
	socket.on('disconnect', function(data) {
		window.location.reload(true);
	});
	$scope.playFunction = function (data) {
		$scope.info = data.message;
		if (data.data.cardObj) {
			if (data.data.cardObj.player == $scope.position) {
				$scope.cards.splice(data.data.cardObj.index, 1);
			}
			$scope.tableData.round[$scope.shifter(data.data.cardObj.player)] = data.data.cardObj.card;
		}
		if (data.data.reveal && data.data.reveal === true) {
		}
		if ($scope.token == $scope.position) {
			$scope.action = "Play";
		} else {
			$scope.action = "Wait";
		}

	};
	$scope.passFunction = function (data) {
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
		$scope.$apply();
	};
	$scope.setDefaultBg = function (option) {
		var card = null;
		if (option === 0)
			card = blank;
		else
			card = $scope.cardBack;
		for (var i = 0; i< $scope.tableData.round.length ; i++) {
			$scope.tableData.round[i] = card;
		}
		$scope.$apply();
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
	$scope.addComputer = function() {
		socket.emit(events.addComputer, {userInfo: userInfo});
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
			if (card.name == blank.name || card.name == $scope.cardBack.name) {
				$scope.info = "Cannot play closed card";
				return;
			}
			//$("#control-data").append("Click : "+card.name);
			socket.emit(events.play, {play:true, userInfo:userInfo, player:$scope.position, cardObj:{card:card, player:$scope.position, index:index}});
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
