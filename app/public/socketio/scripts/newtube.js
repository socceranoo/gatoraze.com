$(document).ready(function() {
});

function Tube($scope) {
	$scope.player = null;
	var events = {
		message:"message", welcome:"welcome", playerJoin:"player-join",
		playerLeave:"player-leave", cards:"cards", play:"play",
		round:"round", game:"game", ready:"ready", addComputer:"add-computer"
	};

	// 3. This function creates an <iframe> (and YouTube player)
	//    after the API code downloads.
	$scope.onYouTubeIframeAPIReady = function () {
		$scope.player = new YT.Player('player', {
			height: '450',
			width: '100%',
			videoId: '1G4isv_Fylg',
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

	$scope.createScript = function () {
		var tag = document.createElement('script');
		tag.src = "//www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	};

	// 4. The API will call this function when the video player is ready.
	$scope.onPlayerReady = function (event) {
		//alert("READY");
	};

	// 5. The API calls this function when the player's state changes.
	//    The function indicates that when playing a video (state=1),
	//    the player should play for six seconds and then stop.
	$scope.onPlayerStateChange = function (event) {
		if (event.data == 1) {
			//alert("PLAY");
		}
		if (event.data != 2) {
			pause = false;
		}
	};
	window.onYouTubeIframeAPIReady = $scope.onYouTubeIframeAPIReady;
	$scope.createScript();
	$scope.searchVideos = function (search_query) {
		ytEmbed.init({'block':'divsearch','type':'search','q':search_query,'results': 10,'layout':'thumbnails', 'order':'most_relevance'});
	};
	$scope.searchVideos("madonna dont tell me");
}

