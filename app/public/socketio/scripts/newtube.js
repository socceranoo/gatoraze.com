$(document).ready(function() {
	createScript();
});

function Tube($scope) {
	var events = {
		message:"message", welcome:"welcome", playerJoin:"player-join",
		playerLeave:"player-leave", cards:"cards", play:"play",
		round:"round", game:"game", ready:"ready", addComputer:"add-computer"
	};
}	
function onPlayerError(errorCode) {
	alert("An error occured of type:" + errorCode);
}
function createScript() {
	var tag = document.createElement('script');
	tag.src = "//www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}
// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
function onYouTubeIframeAPIReady() {
	mainplayer = new YT.Player('player', {
		height: '450',
		width: '640',
		videoId: '1G4isv_Fylg',
		//videoId: 'u1zgFlCw8Aw',
		playerVars: {
			autoplay: '1',
			controls: '1'
		},
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange,
			'onError': onPlayerError
		}
	});
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
	sockinit(user);
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
	if (event.data == 1) {
		play_since_seek = true;
	}
	if (event.data != 2) {
		pause = false;
	}
}
