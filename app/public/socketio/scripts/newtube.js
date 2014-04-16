$(document).ready(function() {
});

function Tube($scope) {
	var PLAY = 1, PAUSE = 2, CUE = 5, ENDED = 0, STOPPED = 4, NEWVIDEO = -1, INIT = -2;
	var NO_OP = function () {
		//Do nothing
	};
	var stateFunctionMap = [
		[0, 1, 2, NO_OP, 4, 5, -1], //ENDED
		[0, 1, 2, NO_OP, 4, 5, -1], //PLAY
		[0, 1, 2, NO_OP, 4, 5, -1], //PAUSE
		[NO_OP, NO_OP, NO_OP, NO_OP, NO_OP, NO_OP, NO_OP], //no-op
		[0, 1, 2, NO_OP, 4, 5, -1], //STOPPED
		[0, 1, 2, NO_OP, 4, 5, -1], //CUE
		[0, 1, 2, NO_OP, 4, 5, -1], //-1 function
	];
	$scope.prevState = INIT;
	$scope.state = INIT;
	$scope.player = null;
	$scope.apiReady = false;
	$scope.searchList = [];
	$scope.playList = {current:"", shuffle:false, repeat:false, videos:{},
		nextVideo : function () {
		},
		prevVideo : function () {
		}
	};
	$scope.nextPageToken = "";
	$scope.prevPageToken = "";
	$scope.prevQuery = "";
	$scope.info = "";
	$scope.connected = false;
	var events = {
		message:"message", welcome:"welcome", playerJoin:"player-join",
		playerLeave:"player-leave", cards:"cards", play:"play",
		round:"round", game:"game", ready:"ready", addComputer:"add-computer"
	};
	var socket = io.connect('', {reconnect:true, 'reconnection delay':5000});
	var userInfo = {user:user, site:site, room:room , session:session, total:total};
	$scope.onYouTubeIframeAPIReady = function () {
		$scope.player = new YT.Player('player', {
			height: '500',
			width: '100%',
			//videoId: '1G4isv_Fylg',
			videoId: '5mqhI2pActU',
			playerVars: {
				autoplay: '0',
				controls: '1'
			},
			events: {
				'onReady': $scope.onPlayerReady,
				'onStateChange': $scope.onPlayerStateChange,
				'onError': $scope.onPlayerError
			}
		});
	};
	$scope.onPlayerError = function (errorCode) {
		//alert("An error occured of type:" + errorCode);
	};

	$scope.loadGoogleAPIClient = function () {
		var CLIENT_ID = 'AIzaSyDa3b-SfgFF9rYXsiWHKUjzrsiCYYSzTKI';
		gapi.client.setApiKey(CLIENT_ID);
		gapi.client.load('youtube', 'v3', function() {
			$scope.handleAPILoaded();
		});
	};
	$scope.createScript = function () {
		var firstScriptTag = document.getElementsByTagName('script')[0];
		if ($scope.player === null) {
			var tag = document.createElement('script');
			tag.src = "https://www.youtube.com/iframe_api";
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		}
		if ($scope.apiReady === false) {
			var ytapi = document.createElement('script');
			ytapi.src = "https://apis.google.com/js/client.js?onload=loadGoogleAPIClient";
			firstScriptTag.parentNode.insertBefore(ytapi, firstScriptTag);
		}
	};

	$scope.onPlayerReady = function (event) {
	};

	$scope.onPlayerStateChange = function (event) {
		$scope.prevState = $scope.state;
		$scope.state = event.data;
		if (event.data== -1) {
			$scope.addControlData("STATE", "New Video");
		} else if (event.data == 1) {
			$scope.addControlData("STATE", "Play");
		} else if (event.data == 2) {
			$scope.addControlData("STATE", "Pause");
		} else if (event.data == 5) {
			$scope.addControlData("STATE", "Cue");
		} else if (event.data === 0) {
			$scope.addControlData("STATE", "Ended");
		} else if (event.data == 4) {
			$scope.addControlData("STATE", "Stopped");
		}
		$scope.processState($scope.state, $scope.prevState);
	};
	$scope.processState = function (cur, prev) {
	};

	$scope.handleAPILoaded = function () {
		$scope.apiReady = true;
		$scope.searchVideos("");
	};

	$scope.searchVideos = function (search_string) {
		var query = (search_string === undefined) ? $scope.query : search_string;
		var obj = {
			q:query,
			part: 'snippet',
			type: 'video',
			maxResults:10,
			videoEmbeddable: true
		};
		$scope.prevQuery = query;
		$scope.executeQuery(obj);
	};
	$scope.showSearchPage = function (token) {
		if (token !== "") {
			var obj = {
				q:$scope.prevQuery,
				pageToken:token,
				part: 'snippet',
				type: 'video',
				maxResults:10,
				videoEmbeddable: true
			};
			$scope.executeQuery(obj);
		}
	};

	$scope.executeQuery = function (queryObj) {
		var request = gapi.client.youtube.search.list(queryObj);
		request.execute(function(response) {
			$scope.nextPageToken = response.result.nextPageToken;
			$scope.prevPageToken = response.result.prevPageToken;
			$scope.searchList = response.result.items;
			$scope.$apply();
		});
	};

	$scope.playVideo = function (videoId) {
		$scope.player.loadVideoById(videoId);
	};
	$scope.addVideo = function (videoObj) {
		$scope.playList.videos[videoObj.id.videoId] = videoObj;
	};
	$scope.removeVideo = function (videoObj) {
		delete $scope.playList.videos[videoObj.id.videoId];
	};

	window.loadGoogleAPIClient = $scope.loadGoogleAPIClient;
	window.onYouTubeIframeAPIReady = $scope.onYouTubeIframeAPIReady;

	//Socket functions
	socket.on('connect', function() {
		// Connected, let's sign-up for to receive messages for this room
		socket.emit('setPseudo', {userInfo: userInfo});
	});
	socket.on(events.welcome, function(data) {
		$("#player").removeClass("red-border").addClass("green-border");
		$scope.addMessage(data.message, data.sender, data.date, data.data);
		$scope.connected = true;
		$scope.addControlData(events.welcome, data.data);
		$scope.info = "Welcome";
		for (var i = 0; i< data.data.length; i++) {
			if (data.data[i] == user) {
				$scope.position = i;
				break;
			}
		}
		socket.on(events.playerJoin, function(data) {
			$scope.info = data.message;
			$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.addControlData(events.playerJoin, data.data);
			if (data.data.inProgress) {
				//$scope.tableData.players[$scope.shifter(data.data.position)] = data.data.name;
			}
			$scope.$apply();
		});
		socket.on(events.playerLeave, function(data) {
			$scope.info = data.message;
			$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.addControlData(events.playerLeave, data.data);
			if (data.data.inProgress) {
				//$scope.tableData.players[$scope.shifter(data.data.position)] = data.data.name;
			}
			$scope.$apply();
		});
		socket.on(events.ready, function(data) {
			$scope.createScript();
			$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.addControlData(events.ready, data.data);
			$scope.$apply();
		});
		socket.on(events.play, function(data) {
			$scope.addMessage(data.message, data.sender, data.date, data.data);
			$scope.addControlData(events.play, data.data);
			$scope.token = data.data.player;
			$scope.$apply();
		});
	});

	//MESSAGE and CONTROL data Handling.
	socket.on(events.message, function(data) {
		$scope.addMessage(data.message, data.sender, data.date, data.data);
	});
	socket.on('disconnect', function(data) {
		$scope.connected = false;
		$scope.info = "Disconnected from Server";
		$("#player").removeClass("green-border").addClass("red-border");
		$scope.$apply();
	});

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

	//playerfunctions
}
