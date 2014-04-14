var socket, user = "";
var	lastseektime = 0;
var mainplayer;
var connection = false;
var state ="play";
var seeker =false;
var seeking_in_progress=false;
var play_since_seek=true;
var userid;
var userclick = false;
var	new_video = false;
var pause = false;
var firstpause = false;
var	load_in_progress = false;
var	initiator = false;
var	first_add = true;
/*
var defaultsrc="http://www.youtube.com/embed/g3Xvn3AymxA";
var videoArr= new Array("kjO-XSgEwew", "7HKoqNJtMTQ", "AlBQFpSVU_s", "PQWwO0vGu44", "g3Xvn3AymxA", "vmPYsBbjl88");
var videoArr1= new Array();
var xlarge= new Array('1280', '800');
var normal= new Array('560', '340');
var small= new Array('480', '285');
var large= new Array('640', '385');
var state="pause";
var next = false, prev= false;
*/
$(document).ready(function() {
	session_id = $("#get_session").data('session');
	user = $("#get_session").data('user');
	var debug = parseInt($("#get_session").data('debug'), 10);
	if (debug === 1) {
		$("#control-log").show();
	}
	log('Welcome to the SyncTube');
	getid("msg").focus();
	if (user == "NOUSER"){
		$("#join-modal").modal();
	}else {
		start(user);
	}
});

function playSound(src) {
	var audiosrc = "images/"+src+".wav";
	$("#audioplayer").attr('src', audiosrc);
	document.getElementById("audioplayer").play();
}
function start(username) {
	user=username;
	createScript();
	$("#main-container").show();
	$("#search-form").show();
	test();
	$("#init-modal").data('toggle', "");
	var js_url = "javascript:void(0);";
	$("#init-modal").attr('href', js_url);
	$("#init-modal").html("");
	$("#init-modal-div").hide();
	$("#join-modal").modal('hide');
}

function joinserver() {
	var msg = getid("input-name").value;
	if (msg === "")
		return;
	start(msg);	
}
function sockinit (user) {
	var host = "ws://gatoraze.com:443/4synctube/include/tubeserver.php"; // SET THIS TO YOUR SERVER
	try {
		log('Connecting to the server ...');
		if ('WebSocket' in window && typeof WebSocket == 'function') {
			socket = new WebSocket(host);
		}
		socket.onopen    = function(msg) {
			$("#con-status").find('a').html("Connected");
			$("#con-status").find('a').addClass("btn-success");
			$("#con-status").show();
			log("Connected"); 
			playSound("newim");
			user_msg = "USER:"+user+";SESSION:"+session_id;
			socket.send(user_msg); 
			connection = true;
		};
		socket.onmessage = function(msg) {
			process(msg.data);
		};
		socket.onclose   = function(msg) {
			connection = false;
			$("#con-status").find('a').html("Disconnected");
			$("#con-status").find('a').removeClass("btn-success").addClass("btn-primary");
			$("#con-status").show();
			log("Disconnected"); 
			playSound("error");
		};
	} catch(ex){ 
		log(ex); 
	}
}
function test() {
	var search_query = "madonna dont tell me";
	ytEmbed.init({'block':'divsearch','type':'search','q':search_query,'results': 10,'layout':'thumbnails', 'order':'most_relevance'});
	return false;
}
function process(msg) {
	match = /NEWUSER:(.*):(.*)/i.exec(msg);
	if(match && match[1] && match[2]) {
		debug_log(msg);
		var new_user =match[1];
		var new_user_id =match[2];
		add_to_userlist(new_user_id, new_user);
		log(match[1]+" joined the room");
		playSound("newuser");
		return;
	}
	match = /REMOVEUSER:(.*)/i.exec(msg);
	if(match && match[1]) {
		debug_log(msg);
		var remove_user_id=match[1];
		var left_user = $("#ul_li_"+match[1]).data('username');
		remove_from_userlist(remove_user_id);
		log(left_user+" left the room");
		playSound("error");
		return;
	}
	match = /INIT:(.*);SERVER_INFO:(.*)/i.exec(msg);
	if(match && match[1] && match[2]) {
		debug_log("USER ID:"+match[1]);
		debug_log(msg);
		userid=match[1];
		handle_server_info(match[2]);
		//serverinfo();
		return;
	}
	match = /OPR:(.*):(.*)/i.exec(msg);
	if(match && match[1]&& match[2]) {
		debug_log(msg);
		switch(match[1]) {
			case "PLAY":
						videoPlay();
						break;
			case "PAUSE":
						videoPause();
						break;
			case "SYNC_REQ":
						var time = parseInt(mainplayer.getCurrentTime(), 10);
						if (state == "play")
							socket.send("OPR:SYNC_RESP_PLAY:"+time);
						else if (state == "pause")
							socket.send("OPR:SYNC_RESP_PAUSE:"+time);

						break;
			case "SYNC_RESP_PLAY":
						time = parseInt(match[2], 10);
						mainplayer.seekTo(time);
						state = "play";
						break;
			case "SYNC_RESP_PAUSE":
						time = parseInt(match[2], 10);
						mainplayer.seekTo(time);
						state = "pause";
						break;
			case "SEEK":
						time = parseInt(match[2], 10);
						if (!seeker) {
							play_since_seek=false;
							seeking_in_progress = true;
							mainplayer.seekTo(time);
						} else
							debug_log("NO ACTION");
						lastseektime = time;
						seeker = false;
						break;
		}
		return;
	}
	match = /ADD:(.*);SRC:(.*);TITLE:(.*)$/i.exec(msg);
	if(match && match[1] && match[2] && match[3]) {
		if (initiator === false) {
			load_in_progress = true;
			addVideo(match[1], match[3]);
		}
		debug_log(msg);
		initiator = false;
		if (first_add){
			load_in_progress = true;
			first_add = false;
		}
		return;
	}
	match = /ADD_TO_PLAYLIST:(.*);SRC:(.*);TITLE:(.*)$/i.exec(msg);
	if(match && match[1] && match[2] && match[3]) {
		add_to_playlist(match[1], match[2], match[3]);
		debug_log(msg);
		return;
	}
	match = /REMOVE_FROM_PLAYLIST:(.*)$/i.exec(msg);
	if(match && match[1]) {
		remove_from_playlist(match[1]);
		debug_log(msg);
		return;
	}
	playSound("newim2");
	log(msg);
}

function remove_from_userlist(usr_id) {
	var userlist_ul = document.getElementById("userlist-ul");
	var ul_li = getid("ul_li_"+usr_id);
	userlist_ul.removeChild(ul_li);
}
function add_to_userlist(usr_id, username) {
	var userlist_ul = document.getElementById("userlist-ul");
	var ul_li = document.createElement('li');
	var h3 = document.createElement('h4');
	ul_li.setAttribute('id', "ul_li_"+usr_id);
	ul_li.setAttribute('data-id', usr_id);
	ul_li.setAttribute('data-username', username);
	if (usr_id != userid) {
		h3.innerHTML=username+"&nbsp;";	
		//h3.innerHTML=username+"&nbsp;"+usr_id;	
	}else {
		h3.innerHTML=username+"(you)&nbsp;";	
		//h3.innerHTML=username+"(you)&nbsp;"+usr_id;	
	}
	ul_li.appendChild(h3);
	userlist_ul.appendChild(ul_li);
}
function add_to_playlist(vidid, imgsrc, title) {
	var playlist_ul = document.getElementById("playlist-ul");
	var pl_li = document.createElement('li');			
	pl_li.className = 'playlist-link clearfix';
	pl_li.setAttribute('id', "pl_li_"+vidid);
	pl_li.setAttribute('data-id', vidid);
	pl_li.setAttribute('data-title', title);
	pl_li.setAttribute('title', title);
	var img2 = document.createElement('img');
	var a = document.createElement('a');
	a.className = "pull-left btn btn-danger btn-small remove-playlist";
	a.innerHTML = "remove";
	a.style.margin = "4px";
	img2.className = 'img-polaroid pull-left video-thumbnail2';
	img2.setAttribute('src', imgsrc);
	img2.setAttribute('title', title);
	var h3 = document.createElement('h4');
	var condtitle = title;
	var title_limit = 38;
	if(condtitle && condtitle.length > title_limit){
		condtitle = title.substr(0, (title_limit-2))+'..';
	}
	h3.innerHTML = "&nbsp;&nbsp;"+condtitle+"<br/><br/>";
	h3.className = 'pl-link-details text-left';
	pl_li.appendChild(img2);
	pl_li.appendChild(h3);
	pl_li.appendChild(a);
	playlist_ul.appendChild(pl_li);
	pl_li.addEventListener('click', function(event) { 
		userclick = true;
		setVideo(vidid, imgsrc, title);
	},false);
	$(".remove-playlist").click(function(event) {
		var li_id = $(event.target).parent();
		var vid_id = $(li_id).data('id');
		send_remove_playlist(vid_id, imgsrc, title); 
		event.stopPropagation();
	});
}
function send_remove_playlist(vidid) {
	if (connection) {
		var msg="REMOVE_FROM_PLAYLIST:"+vidid;
		socket.send(msg);
	}
	else {
		remove_from_playlist(vidid);
	}
}

function remove_from_playlist(vidid) {
	var li = getid("pl_li_"+vidid);
	var playlist_ul = document.getElementById("playlist-ul");
	playlist_ul.removeChild(li);
}
function send_add_playlist(vidid, imgsrc, title) {
	if (connection) {
		var msg="ADD_TO_PLAYLIST:"+vidid+";SRC:"+imgsrc+";TITLE:"+title;
		socket.send(msg);
	}
	else {
		add_to_playlist(vidid, imgsrc, title);
	}
}
function send(){
	var txt,msg;
	txt = getid("msg");
	msg = txt.value;
	if(!msg) { 
		//alert("Message can not be empty"); 
		return; 
	}
	txt.value="";
	txt.focus();
	try { 
		socket.send(msg); 
		log('You : '+msg); 
	} catch(ex) { 
		log(ex); 
	}
}

// Utilities
function getid(id){ return document.getElementById(id); }
function log(msg) {
	var txtareaelem = getid("chat");
	txtareaelem.value += msg;
	txtareaelem.value += "\n";
	txtareaelem.scrollTop = txtareaelem.scrollHeight;
}
function debug_log(msg) {
	var txtareaelem = getid("debug");
	txtareaelem.value += msg;
	txtareaelem.value += "\n";
	txtareaelem.scrollTop = txtareaelem.scrollHeight;
}
function onkey(event, option) {
	if(event.keyCode==13) {
		if (option === 0)
			send();
		else
			joinserver();
	}else if(event.keyCode==32) {
		if (mainplayer) {
			var cur_state = mainplayer.getPlayerState();
			if (cur_state == 1) {
				videoPause();
			}else if (cur_state == 2){
				videoPlay();
			}
		}
	}
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
	var cur_time = 0;
	debug_log("EVENT:"+event.data);
	if (seeking_in_progress === false) {
		if (new_video && (event.data == 1 || event.data== 5)) {
			if (!userclick && load_in_progress === false) {
				initiator = true;
				var vid_id = youtubeIdFromUrl(mainplayer.getVideoUrl());
				var url = "https://gdata.youtube.com/feeds/api/videos/"+vid_id+"?v=2";
				var doc = httpGet(url);
				var title = $(doc).find("title").text();
				var imgsrc = "http://img.youtube.com/vi/"+vid_id+"/0.jpg";
				if (connection)
					setVideo(vid_id, imgsrc, title);
				$("#now-playing").html(title);
			}
			new_video = false;
			userclick = false;
			load_in_progress = false;
		}
		if (event.data== -1) {
			new_video = true;
		}
		if (event.data == 2 && pause) {
			if (connection){
				cur_time = parseInt(mainplayer.getCurrentTime(), 10);
				if (Math.abs(lastseektime - cur_time) > 2) {
					seek();
				}
			}
		}
		if (event.data == 2) {
			pause = true;
		}
		if (connection) {
			if (event.data == 1 && state == "pause") {
				socket.send("OPR:PLAY:"+event.data);
			} else if (event.data== 2 && state == "play") {
				cur_time = parseInt(mainplayer.getCurrentTime(), 10);
				if (Math.abs(lastseektime - cur_time) > 1)
					//socket.send("OPR:PAUSE:"+event.data);
				socket.send("OPR:PAUSE:"+event.data);
			}
		}
		/*	
		else if (event.data== 5) 
			//alert("CUE");
		else if (event.data== 0) 
			//alert("ended");
		else if (event.data== 4) 
			//alert("stoped");
		*/
	}else {
		if (event.data == 2 & firstpause) {
			seeking_in_progress = false;
			firstpause = false;
			return;
		}
		if (event.data == 2) {
			firstpause = true;
			if (!play_since_seek) {
				seeking_in_progress = false;
			}
		}
	}
}

function httpGet(theUrl) {
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", theUrl, false );
	xmlHttp.send( null );
	return xmlHttp.responseText;
}
function seek() {
	if (connection) {
		debug_log("SEEKER IN PROGRESS");
		seeker = true;
		var time = parseInt(mainplayer.getCurrentTime(), 10);
		socket.send("OPR:SEEK:"+time);
	}
}

function setVideo(vidid, src, title) {
	if (connection) {
		var msg="ADD:"+vidid+";SRC:"+src+";TITLE:"+title;
		socket.send(msg);
	}
	else {
		addVideo(vidid, title);
	}
}
function stopVideo() {
	if (mainplayer) {
		mainplayer.stopVideo();
	}
}

function enqueueVideo(vidid, title) {
	mainplayer.cueVideoById(vidid);
	$("#now-playing").html(title);
}
function addVideo(vidid, title) {
	mainplayer.loadVideoById(vidid);
	$("#now-playing").html(title);
}
function videoPlay(pos) {
	mainplayer.playVideo();
	state="play";
}
function videoPause() {
	mainplayer.pauseVideo();
	state="pause";
}
function youtubeIdFromUrl(url)
{
	var video_id = url.split('v=');
	var ampersandPosition = video_id[1].indexOf('&');
	val = video_id[1];
	if(ampersandPosition != -1) {
		video_id = video_id[1].split('&');
		val = video_id[0];
	}
	return val;
}

function stopserver() {
	//$("#servstopbutton").attr("disabled");
	$.post("include/servfunc.php", { str: "stop"}, function(data){
		alert(data.retval+""+data.info);
		$("#servstopbutton").removeAttr("disabled");
		$("#servstate").html("Stopped");
	}, "json");
}
function startserver() {
	//$("#servbutton").attr("disabled");
	$.post("include/servfunc.php", { str: "start"}, function(data){
		alert(data.retval+""+data.info);
		$("#servbutton").removeAttr("disabled");
		$("#servstate").html("Running");
	}, "json");
}
function serverinfo() {
	$.post("include/servfunc.php", { str: "info", session: session_id}, function(data){
		if (data.retval === true) {
			handle_server_info(data.info);
		}
	}, "json");
}
function handle_server_info(json_str) {
	var title, i, imgsrc, vid_id, obj1;
	var obj = JSON.parse(json_str);
	var video_id_str = obj.video_id;
	if (video_id_str !== ""){
		var video_id_obj= JSON.parse(video_id_str);
		title = video_id_obj.title;
		imgsrc = video_id_obj.img_src;
		vid_id = video_id_obj.video_id;
		enqueueVideo(vid_id, title);
		debug_log(vid_id);
	}
	var playlist_json_str = obj.playlist;
	if (playlist_json_str !== "") {
		var obj0 = JSON.parse(playlist_json_str);
		for (i = 0; i < obj0.length ; i++) {
			title = obj0[i].title;
			imgsrc = obj0[i].img_src;
			vid_id = obj0[i].video_id;
			add_to_playlist(vid_id, imgsrc, title);
		}
	}
	/*
	*/
	var user_json_str = obj.user_array;
	if(user_json_str !== "") {
		obj1 = JSON.parse(user_json_str);
		for (i = 0; i < obj1.length ; i++) {
			var usr_id = obj1[i].id;
			var username = obj1[i].username;
			add_to_userlist(usr_id, username);
		}
	}
	var playerstate = parseInt(obj.state, 10);
	if (playerstate == 1) {
		state = "play";
	} else if (playerstate == 2) {
		state = "pause";
	}
	if (obj1.length > 1 ) {
		//if (videoId != "")
		socket.send("OPR:SYNC_REQ:"+userid);
	}
}
/*
function smallPlayer() {
	resizePlayer(small[0], small[1]);
	getid('main').style.width=small[0];
}

function normalPlayer() {
	resizePlayer(normal[0], normal[1]);
	getid('main').style.width=normal[0];
}

function largePlayer() {
	resizePlayer(large[0], large[1]);
	getid('main').style.width=large[0];
}
function resizePlayer(width, height) {
	mainplayer.setSize(parseInt(width), parseInt(height));
}
function updatePlayerInfo() {
	if(mainplayer && mainplayer.getDuration) {
		updateHTML("videoDuration", mainplayer.getDuration());
		updateHTML("videoCurrentTime", mainplayer.getCurrentTime());
		updateHTML("bytesTotal", mainplayer.getVideoBytesTotal());
		updateHTML("startBytes", mainplayer.getVideoStartBytes());
		updateHTML("bytesLoaded", mainplayer.getVideoBytesLoaded());
		updateHTML("volume", mainplayer.getVolume());
	}
}
*/
