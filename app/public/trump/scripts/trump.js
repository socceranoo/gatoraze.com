$(document).ready(function() {
});

function Trump($scope) {
	var events = {
		message:"message", welcome:"welcome", playerJoin:"player-join",
		playerLeave:"player-leave", cards:"cards", play:"play",
		round:"round", game:"game", ready:"ready", addComputer:"add-computer"
	};
	var socket = io.connect();
	var maxArraySize = 5;
	$scope.position = 0;
	$scope.session = 1;
	$scope.message = '';
	$scope.connected = false;
	$scope.messageArr = [];
	$scope.cards = [];
	$scope.token = -1;
	$scope.oldBidObj = null;
	var joker = {name:"JOKER", index:0, bgPos:[111, 0]};
	var blank = {name:"BLANK", index:0, bgPos:[222, 0]};
	$scope.trump = {card:null, setter:'', points:''};
	$scope.tableData = {players : [], round :[], prevRound:[], bidData:[]};
	$scope.bidOver = false;
	var defaultInfo = 'Welcome';
	$scope.info = defaultInfo;

	var userInfo = {user:user, site:site, room:site+$scope.session , session:$scope.session};

	$scope.bidObj = {
		bid:false,
		bidder:0,
		points:0,
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
					$scope.info ='Cannot bid equal or lesser';
					return;
				}
				$scope.action = "Wait";
				socket.emit(events.play, {userInfo: userInfo, play:false, player:$scope.position, trump:null, bidObj:$scope.bidObj});
			}
		},
		passBid: function() {
			if ($scope.bidObj.bid && $scope.token == $scope.position) {
				$scope.action = " ";
				socket.emit(events.play, {userInfo: userInfo, play:false, pass:true, player:$scope.position, trump:null, bidObj:$scope.oldBidObj});
			}
		}
	};

	socket.on('connect', function() {
		// Connected, let's sign-up for to receive messages for this room
		socket.emit('setPseudo', {userInfo: userInfo});
	});
	socket.on(events.welcome, function(data) {
		$scope.addMessage(data.message, data.sender, data.date, data.data);
		$scope.connected = true;
		//$scope.addControlData(events.welcome, data.data);
		for (var i = 0; i< data.data.length; i++) {
			if (data.data[i] == user) {
				$scope.position = i;
				break;
			}
		}
		socket.on(events.playerJoin, function(data) {
			$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.addControlData(events.playerJoin, data.data);
			if (data.data.inProgress) {
				$scope.tableData.players[data.data.position] = data.data.name;
				$scope.$apply();
			}
		});
		socket.on(events.playerLeave, function(data) {
			$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.addControlData(events.playerLeave, data.data);
			if (data.data.inProgress) {
				$scope.tableData.players[data.data.position] = data.data.name;
				$scope.$apply();
			}
		});
		socket.on(events.round, function(data) {
			$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.tableData.prevRound = data.data.prevRound;
			$scope.setDefaultBg(1);
			//$scope.addControlData(events.round, data.data);
		});
		socket.on(events.game, function(data) {
			$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.trump.card = null;
			$scope.trump.setter ='';
			$scope.trump.points ='';
			$scope.bidOver = false;
			$scope.setDefaultBg(0);
			//$scope.addControlData(events.game, data.data);
			$scope.$apply();
		});
		socket.on(events.ready, function(data) {
			var i = 0;
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			//$scope.addControlData(events.ready, data.data);
			$scope.tableData.players = data.data.players;
			for (i = 0; i< $scope.tableData.players.length ; i++) {
				$scope.tableData.round[i] = blank;
				$scope.tableData.bidData[i] = '';
			}
			if (data.data.round) {
				for (i = 0; i< data.data.round.length ; i++) {
					$scope.tableData.round[data.data.round[i].player] = data.data.round[i].card;
				}
			}
			if (data.data.bidData) {
				for (i = 0; i< data.data.bidData.length ; i++) {
					$scope.tableData.bidData[data.data.bidData[i][0]] = data.data.bidData[i][1];
				}
			}
			if (data.data.trumpData && data.data.trumpData.setter != '') {
				$scope.trump.card = joker;
				$scope.trump.setter = data.data.trumpData.setter;
				$scope.trump.points = data.data.trumpData.points;
			}
			$scope.$apply();
		});
		socket.on(events.cards, function(data) {
			$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.cards = $scope.cards.concat(data.data.cards);
			//$scope.addControlData(events.cards, data.data);
			$scope.$apply();
		});
		socket.on(events.play, function(data) {
			//$scope.addMessage(data.message, data.sender, data.date, data.data);
			//$scope.addControlData(events.play, data.data);
			$scope.token = data.data.player;
			if (data.data.play) {
				if (data.data.cardObj) {
					if (data.data.cardObj.player == $scope.position) {
						$scope.cards.splice(data.data.cardObj.index, 1);
					}
					$scope.tableData.round[data.data.cardObj.player] = data.data.cardObj.card;
				}
				if ($scope.token == $scope.position) {
					$scope.action = "Play";
				} else {
					$scope.action = "Wait";
				}
			} else {
				$scope.oldBidObj = data.data.bidObj;
				$scope.bidObj.bid = data.data.bidObj.bid;
				$scope.bidObj.bidder = data.data.bidObj.bidder;
				$scope.bidObj.points = data.data.bidObj.points;
				if (data.data.bidObj.bid && $scope.token == $scope.position) {
					$scope.action = "Bid";
				} else {
					$scope.action = "Wait";
				}

				//Setting trump for the first time
				if ($scope.bidObj.bid === false) {
					if($scope.position == data.data.player) {
						$scope.action = "Set trump";
					}
					if (data.data.bidObj.trump === true) {
						$scope.trump.setter = data.data.bidObj.bidder;
						if ($scope.trump.setter != $scope.position)
							$scope.trump.card = joker;
						$scope.trump.points = data.data.bidObj.points;
						$scope.clearBidData();
						if (data.data.bidObj.round == 2) {
							$scope.bidOver = true;
							$scope.setDefaultBg(1);
						}
					}else {
						if (data.data.pass === true) {
							$scope.tableData.bidData[data.data.bidObj.bidder] = '-';
						} else {
							$scope.tableData.bidData[data.data.bidObj.bidder] = data.data.bidObj.points;
						}
					}
				}
			}
			$scope.$apply();
		});
	});
	socket.on(events.message, function(data) {
		$scope.addMessage(data.message, data.sender, data.date, data.data);
	});
	socket.on('disconnect', function(data) {
		window.location.reload(true);
	});
	$scope.clearBidData = function () {
		for (var i = 0; i< $scope.tableData.bidData.length ; i++) {
			$scope.tableData.bidData[i] = '';
		}
	};
	$scope.setDefaultBg = function (option) {
		var card = null;
		if (option == 0)
			card = blank;
		else
			card = joker;
		for (var i = 0; i< $scope.tableData.round.length ; i++) {
			$scope.tableData.round[i] = card;
		}
		$scope.$apply();
	};
	$scope.addMessage = function (msg, sender, date, data) {
		$("#ccbox").append("<p class=small><span class=date>"+date+"</span><span class=sender>"+sender+"</span><span class=message>"+msg+"</span></p>");
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
			$scope.addMessage($scope.message, "Me :", new Date().toLocaleString(), null);
			$scope.message = '';
		} else {
			socket.emit('event1', {});
		}
	};
	$scope.cardClick = function (card, index) {
		if ($scope.action == "Set trump") {
			socket.emit(events.play, {play:false, trump:card, userInfo:userInfo, bidObj:$scope.oldBidObj});
			$scope.trump.card = card;
			$scope.action = "Wait";
		}
		if ($scope.token == $scope.position && $scope.action == "Play") {
			//$("#control-data").append("Click : "+card.name);
			socket.emit(events.play, {play:true, userInfo:userInfo, player:$scope.position, cardObj:{card:card, player:$scope.position, index:index}});
			$scope.action = "Wait";
		}
	};
}
