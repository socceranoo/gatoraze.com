module.exports = function () {
	var true_var = true;
	var fals_var = false;
	var skill = {
		ccc : {click:true_var,	bg:"#49a120", invert:fals_var,	name:"C",			image:"c",			points:["", "", ""]	},
		cpp : {click:true_var,	bg:"#333333", invert:fals_var,	name:"C++",			image:"c++",		points:["", "", ""]	},
		jav : {click:true_var,	bg:"#F0F56E", invert:true_var,	name:"Java",		image:"java",		points:["", "", ""]	},
		jvs : {click:true_var,	bg:"#F0DB4F", invert:true_var,	name:"JavaScript",	image:"javascript",	points:["", "", ""]	},
		pyt : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"Python",		image:"python",		points:["", "", ""]	},
		prl : {click:true_var,	bg:"#2EA5D9", invert:true_var,	name:"PERL",		image:"perl",		points:["", "", ""]	},
		php : {click:true_var,	bg:"#6182B8", invert:true_var,	name:"Php",			image:"php",		points:["", "", ""]	},
		njs : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"Node JS",		image:"node",		points:["", "", ""]	},
		bsf : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"BookShelf JS",image:"bookshelf",	points:["", "", ""]	},
		ajs : {click:true_var,	bg:"#E52C3C", invert:fals_var,	name:"Angular JS",	image:"angular",	points:["", "", ""]	},
		bjs : {click:true_var,	bg:"#F5F5F5", invert:true_var,	name:"Backbone JS",	image:"backbone",	points:["", "", ""]	},
		fsk : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"Flask",		image:"flask",		points:["", "", ""]	},
		apc : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"Apache",		image:"apache",		points:["", "", ""]	},
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
		ejs : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"express",		image:"expressjs",	points:["", "", ""]	},
		sio : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"SocketIO",	image:"socketio",	points:["", "", ""]	},
		jde : {click:true_var,	bg:"#67CC9A", invert:true_var,	name:"Jade",		image:"jade",		points:["", "", ""]	},
		jin : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"Jinja",		image:"jinja",		points:["", "", ""]	},
		ubu : {click:fals_var,	bg:"#C1392B", invert:fals_var,	name:"Linux",		image:"linux",		points:["", "", ""]	},
		win : {click:fals_var,	bg:"#C1392B", invert:fals_var,	name:"Windows",		image:"windows",	points:["", "", ""]	},
		mac : {click:fals_var,	bg:"#C1392B", invert:fals_var,	name:"MacOS",		image:"mac",		points:["", "", ""]	},
		nix : {click:fals_var,	bg:"#C1392B", invert:fals_var,	name:"Unix",		image:"ubuntu",		points:["", "", ""]	},
		vim : {click:fals_var,	bg:"#4E4E4E", invert:true_var,	name:"Vim",			image:"vim",		points:["", "", ""]	},
		wbs : {click:fals_var,	bg:"#4E4E4E", invert:true_var,	name:"Webstorm",	image:"webstorm",	points:["", "", ""]	},
		git : {click:fals_var,	bg:"#EB5436", invert:true_var,	name:"Git",			image:"git",		points:["", "", ""]	},
	};
	var project_content = require("./projects/data.json");
	var work_content = require("./projects/work.json");
	var exportVariable = {
		pages: [
			{page:0, bg:"clouds", name:"home", fa:"user", icon:"home"},
			{page:1, bg:"emerald", name:"skills", fa:"star", icon:"star"},
			{page:6, bg:"peterRiver", name:"work", fa:"briefcase", icon:"tasks"},
			{page:2, bg:"metroYellow", name:"projects", fa:"code", icon:"tasks"},
			{page:3, bg:"metroCyan", name:"about", fa:"info-circle", icon:"info-sign"},
			{page:4, bg:"metroOrange", name:"awards", fa:"trophy", icon:"certificate"},
			{page:5, bg:"sunFlower", name:"contact", fa:"phone", icon:"earphone"},
			{page:7, bg:"sunFlower", name:"gallery", fa:"image", icon:"earphone"},
		],
		superSet : [
			{bg:"#333333", invert:fals_var, skills:[ skill.ccc, skill.cpp, skill.jvs, skill.pyt, skill.prl, skill.php ], image:"coding", name:"Languages"},
			{bg:"#008A01", invert:fals_var, skills:[ skill.njs, skill.ejs, skill.bsf, skill.fsk, skill.apc, skill.sio ], image:"server-side", name:"Back-End"},
			{bg:"#FF9E3D", invert:true_var, skills:[ skill.htm, skill.jde, skill.jin, skill.ajs, skill.bjs, skill.jqy ], image:"front-end", name:"Front-End"},
			{bg:"#DE664A", invert:fals_var,	skills:[ skill.git, skill.vim, skill.wbs, skill.ubu, skill.win, skill.mac ], image:"tools", name:"General"},
			{bg:"#666699", invert:fals_var,	skills:[ skill.sql, skill.mql, skill.mdb, skill.csd ], image:"db", name:"Databases"},
			{bg:"#FFB319", invert:true_var,	skills:[ skill.les, skill.css, skill.psp, skill.btp ], image:"ux2", name:"UI/UX"},
			//{bg:"#3587D4", invert:true_var,	skills:[ skill.ubu, skill.nix, skill.win, skill.mac ], image:"general", name:"OS"},
		],
		interests : [
			{invert:fals_var,	name:"a Gator", image:"gator3", col:4, bg:"metroGreen", desc:"graduated from Florida, Gainesville (2010) with Masters degree in computer engineering"},
			{invert:true_var,	name:"Symantec", image:"symantec", col:4, bg:"metroYellow", desc:"been working at Symantec Corp. Mountain View, CA for almost 4 years now"},
			{invert:fals_var,	name:"Soccer", image:"soccer2", col:4, bg:"peterRiver", desc:"a huge soccer buff, won't miss out on a chance to play on any occasion"},
			{invert:true_var,	name:"Real Madrid", image:"madrid", col:4, bg:"sunFlower", desc:"a die-hard fan of Real Madrid C.F, almost follow them religiously"},
			{invert:fals_var,	name:"FIFA", image:"fifa2", col:4, bg:"alizarin", desc:"don't do bad either and compete in the virtual spectrum of the beautiful game of soccer"},
			{invert:fals_var,	name:"a Techie", image:"tech", col:6, bg:"belizeHole", desc:"up to date with all the stuff going on in the tech and gadget world"},
			{invert:true_var,	name:"Music", image:"music", col:4, bg:"orange", desc:"will just listen to any song, any genre, any language which is good"},
			{invert:true_var,	name:"Ninja", image:"kawasaki", col:6, bg:"limeGreen", desc:"enjoy the ride on my kawasaki ninja 650r every once in a while"},
			{invert:fals_var,	name:"a Coder", image:"coding", col:4, bg:"metroRed", desc:"like to experiment with code, end up pretty much coding all the time"}
		],
		projects : project_content,
		works: work_content
	};
	for (var i in exportVariable.interests) {
		exportVariable.interests[i].index = i;
	}
	return exportVariable;
};
