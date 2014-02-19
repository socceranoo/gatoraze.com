$(document).ready(function() {
});

function Trump($scope) {
	var events = {
		message:"message", welcome:"welcome", playerJoin:"player-join",
		playerLeave:"player-leave", cards:"cards", play:"play",
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
	var joker = {name:"Trump", index:0, bgPos:[111, 0]};
	$scope.trump = joker;

	var userInfo = {user:user, site:site, room:site+$scope.session , session:$scope.session};

	$scope.bidObj = {
		bid:false,
		bidder:{name:'', position:0},
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
				$scope.action = " ";	
				socket.emit(events.play, {userInfo: userInfo, play:false, bidObj:$scope.bidObj});
			}
		},
		passBid: function() {
			if ($scope.bidObj.bid && $scope.token == $scope.position) {
				$scope.action = " ";	
				socket.emit(events.play, {userInfo: userInfo, play:false, pass:true, bidObj:$scope.oldBidObj});
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
		$scope.addControlData(events.welcome, data.data);
		$scope.position = data.data[user];

		socket.on(events.playerJoin, function(data) {
			$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.addControlData(events.playerJoin, data.data);
		});
		socket.on(events.playerLeave, function(data) {
			$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.addControlData(events.playerLeave, data.data);
		});
		socket.on(events.cards, function(data) {
			$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.cards = $scope.cards.concat(data.data.cards);
			$scope.addControlData(events.cards, data.data);
			$scope.$apply();
		});
		socket.on(events.play, function(data) {
			$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.addControlData(events.play, data.data);
			$scope.token = data.data.player;
			if (data.data.play) {
				$scope.bidObj.bid = false;
				$scope.action = "Your turn to play";	
			} else {
				if (data.data.bidObj.bid && $scope.token == $scope.position) {
					$scope.action = "Your turn to bid";	
				}
				$scope.oldBidObj = data.data.bidObj;
				$scope.bidObj.bid = data.data.bidObj.bid;
				$scope.bidObj.points = data.data.bidObj.points;
				$scope.bidObj.bidder.name = data.data.bidObj.bidder.name;
				$scope.bidObj.bidder.position = data.data.bidObj.bidder.position;

				//Setting trump for the first time
				if ($scope.bidObj.bid === false) {
					if(	$scope.position == $scope.bidObj.bidder.position) {
						$scope.action = "Set trump";	
					} else {
						$scope.trump = joker;
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
	$scope.addMessage = function (msg, sender, date, data) {
		$("#ccbox").append("<p class=small><span class=date>"+date+"</span><span class=sender>"+sender+"</span><span class=message>"+msg+"</span></p>");
		$('#ccbox').scrollTop($("#ccbox").prop('scrollHeight'));
	};
	$scope.addControlData = function (event, data) {
		$("#control-data").append(event+" : "+JSON.stringify(data));
	};
	$scope.sendMessage = function() {
		if ($scope.message !== "") {
			socket.emit(events.message, $scope.message);
			$scope.addMessage($scope.message, "Me", new Date().toLocaleString(), null);
			$scope.message = '';
		} else {
			socket.emit('event1', {});
		}
	};
	$scope.cardClick = function (card) {
		if ($scope.action == "Set trump") {
			socket.emit(events.play, {play:false, trump:card, userInfo:userInfo, bidObj:$scope.oldBidObj});
			$scope.trump = card;
			$scope.action = " ";
		}
		if ($scope.token == $scope.position) {
			$("#control-data").append("Click : "+JSON.stringify(card));
		}
	};
	
}
