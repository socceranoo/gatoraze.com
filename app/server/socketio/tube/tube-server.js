var ALL = 2, ALL_BUT_SENDER = 1, SENDER = 0;
var events = require('../game/events').events;
function player(name) {
	this.name = name;
}
function tube(num, room) {
	this.room = room;
	this.totalPlayers = num;
	this.addHumanMember = function (newPlayer) {
		var sendData = [];
		var message, compName, data, playerObj;
		if (this.members[newPlayer]) {
			message = newPlayer+" duplicate login ";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:{error:true}});
			return [false, sendData];
		}
		if (this.roomFull()) {
			message = "Room "+this.room+" is full try joining someother room";
			sendData.push({dest:SENDER , event:events.message, message:message,  data:{error:true}});
			return [false, sendData];
		}
		playerObj = new player(newPlayer);
		this.members[newPlayer] = playerObj;
		message = "Welcome to the game room "+this.room;
		this.welcomeObj.video = this.video;
		//console.log(JSON.stringify(this.welcomeObj.video));
		sendData.push({dest:SENDER, event:events.welcome, message:message, data:this.welcomeObj});
		message = newPlayer + " joined this room.";
		data = this.members;
		sendData.push({dest:ALL_BUT_SENDER, event:events.playerJoin, message:message, data:data});
		return [true, sendData];
	};

	this.removeHumanMember = function (exitingPlayer) {
		var sendData = [];
		var message, compName, data, playerObj;
		if (this.members[exitingPlayer]) {
			message = exitingPlayer + " left this room " +this.room;
			playerObj = this.members[exitingPlayer];
			data = {name:exitingPlayer};
			delete this.members[exitingPlayer];
			if (this.humanCount() === 0) {
				//this.resetTable();
			}
			data = this.members;
			sendData.unshift({dest:ALL_BUT_SENDER , event:events.playerLeave, message:message,  data:data});
			return sendData;
		}
	};

	this.roomFull = function () {
		return (Object.keys(this.members).length == this.totalPlayers);
	};

	this.getStartingVideo = function () {
		return {
			kind: "youtube#video",
			etag: "\"X98aQHqGvPBJLZLOiSGUHCM9jnE/EbMttCmcY_CyWoS4drM1HKEojlc\"",
			id: "1G4isv_Fylg",
			snippet: {
				publishedAt: "2011-10-19T02:42:54.000Z",
				channelId: "UCDPM_n1atn2ijUwHd0NNRQw",
				title: "Coldplay - Paradise",
				description: "This video was directed by Mat Whitecross in 2011 and was filmed in South Africa and London\n.",
				thumbnails: {
					default: {
						url: "https://i1.ytimg.com/vi/1G4isv_Fylg/default.jpg"
					},
					medium: {
						url: "https://i1.ytimg.com/vi/1G4isv_Fylg/mqdefault.jpg"
					},
					high: {
						url: "https://i1.ytimg.com/vi/1G4isv_Fylg/hqdefault.jpg"
					}
				},
				channelTitle: "Coldplay Official",
				categoryId: "10",
				liveBroadcastContent: "none"
			},
			contentDetails: {
				duration: "PT4M21S",
				dimension: "2d",
				definition: "hd",
				caption: "false",
				licensedContent: true,
			},
			statistics: {
				viewCount: "271369335",
				likeCount: "1222130",
				dislikeCount: "24588",
				favoriteCount: "0",
				commentCount: "214801"
			}
		};
	};
	this.humanCount = function () {
		return Object.keys(this.members).length;
	};
	this.getTableInfo = function (retdata) {
		retdata.inProgress = true;
		retdata.total = this.totalPlayers;
		retdata.active = this.humanCount();
		retdata.totalPoints = this.totalPoints;
		retdata.playerInfo = Object.keys(this.members);
	};

	this.resetTable = function () {
		this.video = this.getStartingVideo();
		this.state = {data:-1, time:0};
		this.members = {};
		this.playList = {shuffle:false, repeat:false, videos:{}};
		this.welcomeObj = {state:this.state, video:this.video, playList:this.playList, tubers:this.members};
	};
	this.resetTable();

	this.playerPlay = function (data) {
		var sendData = [];
		delete data.userInfo;
		if (data.play)
			return this.stateOperation(data, sendData);
		else
			return this.listOperation(data, sendData);
	};

	this.stateOperation = function (data, sendData) {
		var message = data.player;
		if (data.new === true) {
			message = message + " changed the video to "+data.video.snippet.title;
			this.video = data.video;
		} else {
			//message = message + " removed the video "+data.video.snippet.title;
		}
		//console.log(JSON.stringify(this.video));
		sendData.push({dest:ALL, event:events.play, message:message, data:data});
		return sendData;
	};
	this.listOperation = function (data, sendData) {
		var message = data.player;
		if (data.add && data.add === true) {
			this.playList.videos[data.video.id] = data.video;
			message = message + " added the video "+data.video.snippet.title;
		} else if (data.add && data.add === false) {
			delete this.playList.videos[data.video.id];
			message = message + " removed the video "+data.video.snippet.title;
		}
		//console.log(JSON.stringify(this.welcomeObj));
		sendData.push({dest:ALL, event:events.play, message:message, data:data});
		return sendData;
	};
}
exports.createGame = function(data) {
	return new tube(data.total, data.room);
};
