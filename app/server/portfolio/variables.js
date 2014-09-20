module.exports = function () {
	var true_var = true;
	var fals_var = false;
	var skill = {
		cpp : {click:true_var,	bg:"#333333", invert:fals_var,	name:"C/C++",		image:"c++",		points:["", "", ""]	},
		jvs : {click:true_var,	bg:"#F0DB4F", invert:true_var,	name:"JavaScript",	image:"javascript",	points:["", "", ""]	},
		njs : {click:true_var,	bg:"#85CD2B", invert:true_var,	name:"Node JS",		image:"node",		points:["", "", ""]	},
		ajs : {click:true_var,	bg:"#E52C3C", invert:fals_var,	name:"Angular JS",	image:"angular",	points:["", "", ""]	},
		bjs : {click:true_var,	bg:"#F5F5F5", invert:true_var,	name:"Backbone JS",	image:"backbone",	points:["", "", ""]	},
		pyt : {click:true_var,	bg:"#ECF0F1", invert:true_var,	name:"Python",		image:"python",		points:["", "", ""]	},
		fsk : {click:true_var,	bg:"#FFFFFF", invert:true_var,	name:"Flask",		image:"flask",		points:["", "", ""]	},
		php : {click:true_var,	bg:"#6182B8", invert:true_var,	name:"Php",			image:"php",		points:["", "", ""]	},
		apc : {click:true_var,	bg:"#FFFFFF", invert:true_var,	name:"Apache",		image:"apache",		points:["", "", ""]	},
		sql : {click:true_var,	bg:"#EBEBEB", invert:true_var,	name:"SQLite",		image:"sqlite",		points:["", "", ""]	},
		mql : {click:true_var,	bg:"#2C596E", invert:fals_var,	name:"MySQL",		image:"mysql",		points:["", "", ""]	},
		mdb : {click:true_var,	bg:"#82C564", invert:true_var,	name:"mongoDB",		image:"mongo",		points:["", "", ""]	},
		csd : {click:true_var,	bg:"#E6F7FF", invert:true_var,	name:"Cassandra",	image:"cassandra",	points:["", "", ""]	},
		les : {click:true_var,	bg:"#223553", invert:fals_var,	name:"Less",		image:"less",		points:["", "", ""]	},
		btp : {click:true_var,	bg:"#2D143E", invert:fals_var,	name:"Bootstrap",	image:"bootstrap",	points:["", "", ""]	},
		htm : {click:true_var,	bg:"#F0652C", invert:fals_var,	name:"HTML5",		image:"html5",		points:["", "", ""]	},
		css : {click:true_var,	bg:"#1299D1", invert:fals_var,	name:"CSS3",		image:"css",		points:["", "", ""]	},
		psp : {click:true_var,	bg:"#96CAFE", invert:true_var,	name:"PhotoShop",	image:"photoshop",	points:["", "", ""]	},
		jqy : {click:true_var,	bg:"#347CB3", invert:fals_var,	name:"jQuery",		image:"jquery",		points:["", "", ""]	},
		ejs : {click:true_var,	bg:"#F1DB52", invert:true_var,	name:"express",		image:"expressjs",	points:["", "", ""]	},
		sio : {click:true_var,	bg:"#AAD959", invert:true_var,	name:"SocketIO",	image:"socketio",	points:["", "", ""]	},
		jde : {click:true_var,	bg:"#67CC9A", invert:true_var,	name:"Jade",		image:"jade",		points:["", "", ""]	},
		jin : {click:true_var,	bg:"#FFFFFF", invert:true_var,	name:"Jinja",		image:"jinja",		points:["", "", ""]	},
		vim : {click:fals_var,	bg:"#4E4E4E", invert:true_var,	name:"Vim",			image:"vim",		points:["", "", ""]	},
		ubu : {click:fals_var,	bg:"#C1392B", invert:fals_var,	name:"Linux",		image:"linux",		points:["", "", ""]	},
		win : {click:fals_var,	bg:"#C1392B", invert:fals_var,	name:"Windows",		image:"windows",	points:["", "", ""]	},
		mac : {click:fals_var,	bg:"#C1392B", invert:fals_var,	name:"MacOS",		image:"mac",		points:["", "", ""]	},
		nix : {click:fals_var,	bg:"#C1392B", invert:fals_var,	name:"Unix",		image:"ubuntu",		points:["", "", ""]	},
	};
	var exportVariable = {
		pages: [
			{bg:"clouds", name:"home", fa:"home", icon:"home"},
			{bg:"emerald", name:"skills", fa:"star", icon:"star"},
			{bg:"peterRiver", name:"work", fa:"th-list", icon:"tasks"},
			{bg:"metroCyan", name:"about", fa:"user", icon:"info-sign"},
			{bg:"metroOrange", name:"awards", fa:"trophy", icon:"certificate"},
			{bg:"sunFlower", name:"contact", fa:"phone", icon:"earphone"},
		],
		superSet : [
			{bg:"#91A6A1", invert:fals_var, skills:[ skill.cpp, skill.njs, skill.ejs, skill.pyt, skill.fsk, skill.apc, skill.php, skill.sio ], image:"server-side", name:"Back-End"},
			{bg:"#7CB1E6", invert:true_var, skills:[ skill.jvs, skill.ajs, skill.bjs, skill.jde, skill.les, skill.jin, skill.jqy ], image:"front-end", name:"Front-End"},
			{bg:"#2AB3BE", invert:true_var,	skills:[ skill.htm, skill.css, skill.psp, skill.btp ], image:"ux", name:"UI/UX"},
			{bg:"#FF8C01", invert:true_var,	skills:[ skill.sql, skill.mql, skill.mdb, skill.csd ], image:"db", name:"Databases"},
			{bg:"#FCD209", invert:true_var,	skills:[ skill.ubu, skill.win, skill.mac, skill.vim ], image:"general", name:"General"}
		],
		interests : [
			{invert:fals_var,	name:"I love tech", index:0, image:"tech", col:6, bg:"belizeHole", points:["", "", ""]},
			{invert:fals_var,	name:"A Gator", index:1, image:"gator3", col:4, bg:"metroGreen", points:["", "", ""]},
			{invert:true_var,	name:"Symantec", index:2, image:"symantec", col:4, bg:"metroYellow", points:["", "", ""]},
			{invert:true_var,	name:"Ninja !!!", index:3, image:"kawasaki", col:6, bg:"limeGreen", points:["", "", ""]},
			{invert:fals_var,	name:"Soccer", index:4, image:"soccer2", col:4, bg:"peterRiver", points:["", "", ""]},
			{invert:true_var,	name:"Real Madrid", index:5, image:"madrid", col:4, bg:"sunFlower", points:["", "", ""]},
			{invert:fals_var,	name:"FIFA", image:"fifa2", index:6, col:4, bg:"alizarin", points:["", "", ""]},
			{invert:true_var,	name:"Music", image:"music", index:7, col:4, bg:"orange", points:["", "", ""]}
		],

		projects : [
			{img:'gameroom.png', name:"game-room", screens:6},
			{img:'gitstats.png', name:"git-stats", screens:6},
			{img:'emblem.png', name:"gatoraze.com", screens:6},
			{img:'dollaraze.png', name:"dollaraze", screens:6},
			{img:'bugspies.png', name:"bug-spies", screens:6},
			{img:'razetube.png', name:"raze-tube", screens:6}
		]
	};
	return exportVariable;
};
