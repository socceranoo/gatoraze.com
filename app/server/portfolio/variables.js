module.exports = function () {
	var true_var = true;
	var fals_var = false;
	var skill = {
		ccc : {click:true_var,	bg:"#49a120", invert:fals_var,	name:"C",			image:"c",			points:["", "", ""]	},
		cpp : {click:true_var,	bg:"#333333", invert:fals_var,	name:"C++",			image:"c++",		points:["", "", ""]	},
		jav : {click:true_var,	bg:"#F0F56E", invert:true_var,	name:"java",		image:"java",		points:["", "", ""]	},
		jvs : {click:true_var,	bg:"#F0DB4F", invert:true_var,	name:"javaScript",	image:"javascript",	points:["", "", ""]	},
		pyt : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"python",		image:"python",		points:["", "", ""]	},
		prl : {click:true_var,	bg:"#2EA5D9", invert:true_var,	name:"perl",		image:"perl",		points:["", "", ""]	},
		php : {click:true_var,	bg:"#6182B8", invert:true_var,	name:"Php",			image:"php",		points:["", "", ""]	},
		htm : {click:true_var,	bg:"#F0652C", invert:fals_var,	name:"html",		image:"html5",		points:["", "", ""]	},
		css : {click:true_var,	bg:"#1299D1", invert:fals_var,	name:"css",			image:"css",		points:["", "", ""]	},
		njs : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"node JS",		image:"node",		points:["", "", ""]	},
		bsf : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"bookshelf JS",image:"bookshelf",	points:["", "", ""]	},
		ajs : {click:true_var,	bg:"#E52C3C", invert:fals_var,	name:"Angular JS",	image:"angular",	points:["", "", ""]	},
		bjs : {click:true_var,	bg:"#F5F5F5", invert:true_var,	name:"backbone JS",	image:"backbone",	points:["", "", ""]	},
		fsk : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"Flask",		image:"flask",		points:["", "", ""]	},
		apc : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"Apache",		image:"apache",		points:["", "", ""]	},
		sql : {click:true_var,	bg:"#EBEBEB", invert:true_var,	name:"SQLite",		image:"sqlite",		points:["", "", ""]	},
		mql : {click:true_var,	bg:"#2C596E", invert:fals_var,	name:"MySQL",		image:"mysql",		points:["", "", ""]	},
		mdb : {click:true_var,	bg:"#82C564", invert:true_var,	name:"mongoDB",		image:"mongo",		points:["", "", ""]	},
		csd : {click:true_var,	bg:"#E6F7FF", invert:true_var,	name:"cassandra",	image:"cassandra",	points:["", "", ""]	},
		les : {click:true_var,	bg:"#223553", invert:fals_var,	name:"less",		image:"less",		points:["", "", ""]	},
		btp : {click:true_var,	bg:"#2D143E", invert:fals_var,	name:"bootstrap",	image:"bootstrap",	points:["", "", ""]	},
		psp : {click:true_var,	bg:"#96CAFE", invert:true_var,	name:"PhotoShop",	image:"photoshop",	points:["", "", ""]	},
		jqy : {click:true_var,	bg:"#347CB3", invert:fals_var,	name:"jQuery",		image:"jquery",		points:["", "", ""]	},
		ejs : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"express",		image:"expressjs",	points:["", "", ""]	},
		sio : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"SocketIO",	image:"socketio",	points:["", "", ""]	},
		jde : {click:true_var,	bg:"#67CC9A", invert:true_var,	name:"Jade",		image:"jade",		points:["", "", ""]	},
		jin : {click:true_var,	bg:"#EFEFEF", invert:true_var,	name:"Jinja",		image:"jinja",		points:["", "", ""]	},
		ubu : {click:fals_var,	bg:"#C1392B", invert:fals_var,	name:"Linux",		image:"linux",		points:["", "", ""]	},
		win : {click:fals_var,	bg:"#C1392B", invert:fals_var,	name:"Windows",		image:"windows",	points:["", "", ""]	},
		mac : {click:fals_var,	bg:"#C1392B", invert:fals_var,	name:"MacOS",		image:"mac",		points:["", "", ""]	},
		nix : {click:fals_var,	bg:"#FFFFFF", invert:fals_var,	name:"unix",		image:"unix",		points:["", "", ""]	},
		rmq : {click:fals_var,	bg:"#FFFFFF", invert:fals_var,	name:"Rabbit mq",	image:"rabbit-mq",	points:["", "", ""]	},
		vim : {click:fals_var,	bg:"#4E4E4E", invert:true_var,	name:"vim",			image:"vim",		points:["", "", ""]	},
		git : {click:fals_var,	bg:"#EB5436", invert:true_var,	name:"git",			image:"git",		points:["", "", ""]	},
	};
	var project_content = [
		{img:"gameroom.png", desc:"an online multiplayer card game portal with inbuilt AI engine", heading:"razePlay", folder:"gameroom", name:"raze-play",
			link:"http://gatoraze.com/razeplay",
			github:"https://github.com/socceranoo/gatoraze.com/tree/master/app/server/socketio/game",
			about:"This is a multiplayer card game website with support for multiple card games. It is implemented using Node JS with Socket I/O on the back end and web sockets in the front end. Currently has Trump, Hearts and Spades.",
			motivation:" a huge fan of the game Trump, a south asian bridge like card game. Wanted to create an online site to play with friends.",
			skills:[ skill.njs, skill.ejs, skill.sio, skill.htm, skill.jde, skill.ajs, skill.jqy, skill.les ],
			features:[
				"has an AI engine, which allows a game to continue/start without online players at any point in the game.",
				"has guest logins and session management using cookies to track user positions and helps players to rejoin the same game.",
				"has support for multiple rooms for a game at the same time",
				"has a custom implemented object model for Players, Cards, Hands, Tables, Rooms, Rounds etc",
				"has an in game chat console to send real time text to other players in the room",
				"has a rule engine to point the valid cards for a particular round even before the card is played.",
				"planning to implement easy, medium and hard difficulty levels for AI",
			],
			screens : [ "1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png" ],
			content:[
				{sub:"", img:"1.png", desc:"This is gameroom1"},
				{sub:"", img:"2.png", desc:"This is gameroom2"},
				{sub:"", img:"3.png", desc:"This is gameroom3"},
				{sub:"", img:"4.png", desc:"This is gameroom4"},
				{sub:"", img:"5.png", desc:"This is gameroom5"},
				{sub:"", img:"6.png", desc:"This is gameroom6"},
				{sub:"", img:"7.png", desc:"This is gameroom7"}
			]
		},
		{img:"gitstats.png", desc:"an offline, intuitive statistics tool for local and private git repositories", heading:"gitStats", folder:"gitstats", name:"cool-git-stats",
			link:"http://gatoraze.com/coolgitstats",
			github:"https://github.com/socceranoo/git-awsum-stats",
			about:"This is an offline statistics tool for git repositories implemented using Python. This tool enhances the already developed opensource tool gitstats for better and intuitive visualization",
			motivation:"a fan of git and wanted to contribute to the opensource git community.",
			features:[
				"has a dashboard giving a summary of all th statistics.",
				"has statistics based on user, days of week, months, years, timezone, time of the day, lines of code, tags and file types.",
			],
			skills:[ skill.pyt, skill.git, skill.jvs, skill.htm, skill.ajs ],
			screens : [ "1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png" ],
			content:[
				{sub:"", img:"1.png", desc:"This is gitstats1"},
				{sub:"", img:"2.png", desc:"This is gitstats2"},
				{sub:"", img:"3.png", desc:"This is gitstats3"},
				{sub:"", img:"4.png", desc:"This is gitstats4"},
				{sub:"", img:"5.png", desc:"This is gitstats5"},
				{sub:"", img:"6.png", desc:"This is gitstats6"},
				{sub:"", img:"7.png", desc:"This is gitstats7"}
			]
		},
		{img:"emblem.png", desc:"a fast, clean, simple and scalable registration/login portal using node js and mysql", heading:"gatoRaze.com", folder:"raze.com", name:"raze.com",
			link:"http://gatoraze.com",
			github:"https://github.com/socceranoo/gatoraze.com",
			about:"A registration portal developed using Node Js and Mysql. This is a fast, highly scalable version of the portal originally developed by github user Stephen Braitsch. This was enhanced using Mysql and Node ORM bookshelf JS.",
			skills:[ skill.njs, skill.ejs, skill.bsf, skill.htm, skill.jde, skill.mql, skill.ajs, skill.les ],
			screens : [ "1.png", "2.png", "3.png", "4.png" ],
			features:[
				"has username verification and password recvoery through email",
			],
			content:[
				{sub:"", img:"1.png", desc:"This is "},
				{sub:"", img:"2.png", desc:"This is "},
				{sub:"", img:"3.png", desc:"This is "},
				{sub:"", img:"4.png", desc:"This is "}
			]
		},
		{img:"dollaraze.png", desc:"an online expenses tracking and sharing service for debt settlement between friends", heading:"dollaRaze", folder:"dollaraze", name:"dollaraze",
			link:"http://gatoraze.com/money",
			github:"https://github.com/socceranoo/gatoraze.com/blob/master/app/modules/money-table.js",
			about:"This is an online expense tracking and sharing site where friends can record, add and settle debts with others. This site has a Node Js, Mysql and Bookshelf JS backend and Angular JS in the front end. This site works with the above implemented registration and login portal.",
			skills:[ skill.njs, skill.ejs, skill.bsf, skill.htm, skill.jde, skill.mql, skill.ajs, skill.les ],
			screens : [ "1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png" ],
			motivation:"was fed up of online expense tracking websites going down one by one. So wanted to develop something quick to track expenses between my friends.",
			features:[
				"has add, delete, recover bill capability.",
				"allows multiple payers and multiple participants.",
				"has automatic adjustments of equal and unequal splits.",
				"provides a clean and neat summary of user's debts.",
				"has option to add new friends.",
				"planning to implement debt shuffle feature.",
			],
			content:[
				{sub:"", img:"1.png", desc:"This is dollaraze1"},
				{sub:"", img:"2.png", desc:"This is dollaraze2"},
				{sub:"", img:"3.png", desc:"This is dollaraze3"},
				{sub:"", img:"4.png", desc:"This is dollaraze4"},
				{sub:"", img:"5.png", desc:"This is dollaraze5"},
				{sub:"", img:"6.png", desc:"This is dollaraze6"},
				{sub:"", img:"7.png", desc:"This is dollaraze7"}
			]
		},
		{img:"razetube.png", desc:"an online multi guest service to search and watch youtube videos together", heading:"razeTube", folder:"razetube", name:"razetube",
			link:"http://gatoraze.com/razeplay/tube-lobby",
			github:"https://github.com/socceranoo/gatoraze.com/tree/master/app/server/socketio",
			about:"This is an online multiuser service which allows users to watch youtube videos together. It integrates with the Youtube public APIs to search and fetch videos on the fly. This has a Node JS/Socket I/O back end and an Angular front end. This is incorporated with the gameroom for socket and room managerment",
			skills:[ skill.njs, skill.ejs, skill.sio, skill.htm, skill.jde, skill.ajs, skill.jqy, skill.les ],
			screens : [ "1.png", "2.png", "3.png", "4.png", "5.png" ],
			features:[
				"has an embedded youtube flash player in the site",
				"captrures the Youtube player's state and relays to the room",
				"can search, pause, resume, load videos at any point",
				"has option to add, delete videos from the playlist",
				"has a chat console to send real time text to other tubers in the room",
				"planning to capture and relay the seek video event",
			],
			content:[
				{sub:"", img:"1.png", desc:"This is "},
				{sub:"", img:"2.png", desc:"This is "},
				{sub:"", img:"3.png", desc:"This is "},
				{sub:"", img:"4.png", desc:"This is "},
				{sub:"", img:"5.png", desc:"This is "}
			]
		},
		{img:"nflstats.png", desc:"an intuitive visual site to see season statistics of your favorite NFL teams and players", heading:"nflStats", folder:"nflstats", name:"nflstats",
			link:"",
			github:"",
			about:"This is an UI extension of already existing python tools nflgame and nfldb. The backend for getting stats has python and PostGresSQL. Search for nfldb and nflgame opensource utilities to know further. This site has a clean and queriable UI to make use of the python scripts in the backend.",
			skills:[ skill.pyt, skill.njs, skill.ejs, skill.htm, skill.jde, skill.ajs, skill.les ],
			screens : [ "1.png", "2.png", "3.png", "4.png", "5.png" ],
			motivation:"a huge fan of competitive sports like soccer and football. Wanted to make use of open source sports statistics tools to develop a clean UI.",
			features:[
				"has team and individual player statistics",
				"has statistics at team, division, conference and league level",
				"has details of all up to date player rosters and matches",
				"has individual categories like passing, running, receiving, tackles, fumbles etc.",
				"has queriable week level statistics",
			],
			content:[
				{sub:"", img:"1.png", desc:"This is "}
			]
		}
	];
	var work_content = [
		{img:"openstack.png", desc:"a Symantec-HP disaster recovery as a service to HP openstack cloud", heading:"cloud draas", folder:"bugspies", name:"DRaaS to HP cloud", link:"",
			about:"This product came out of a Symantec-HP partnership in the Recovery as a service space. In a nutshell, this is a disaster recovery product which can move on premise workloads to HP openstack cloud",
			role:"Been part of design team from the beginning, involving in end to end design of the product mainly from the data replication aspect. Also currently own and designed few of the replication components in detail. Much of my involvement in this project is confidential and not to be revealed. This is a diverse product, helped to learn a lot of new skills",
			skills:[ skill.ccc, skill.pyt, skill.mql, skill.fsk, skill.apc, skill.ubu ],
			content:[
				//{sub:"", img:"1.png", desc:"This is "}
			]
		},
		{img:"symantec.png", desc:"an end to end prototype for disaster recovery solution", heading:"draas prototype", folder:"bugspies", name:"DRaaS prototype", link:"",
			about:"This end to end prototype was developed as a proof of concept for the previously described disaster recovery product.",
			role:"In a team of 2, designed, coded and demoed an end to end recovery solution including data replication, migrate work flow automation into a local Openstack cloud environment. Also cannot go into much details about the features of this prototype, but still including this project as this was one the most challenging and diverse projects encompassing all parts of the stack (back-end, front-end, databases and UI)",
			skills:[ skill.ccc, skill.pyt, skill.fsk, skill.rmq, skill.htm, skill.mdb, skill.ajs, skill.les ],
			content:[
				//{sub:"", img:"1.png", desc:"This is "}
			]
		},
		{img:"veritas.png", desc:"a high availability feature in Veritas Cluster Server to intelligenlty select a failover node", heading:"adaptive HA", folder:"bugspies", name:"adaptive HA", link:"",
			skills:[ skill.ccc, skill.cpp, skill.prl, skill.nix ],
			about:"Veritas Cluster Server(VCS) is the leading product in the market in providing high availability for various enterprise storage resources as well as application workloads. This feature in VCS was to include predicted system and application resource utilization as well during failover decisions. It also included the design of capacity planning inside a data center based on the predictive analysis of system resource utilization of various application workloads. This feature also leveraged and enhanced the exixting statistics tool.",
			role:"Responsible for the desgin and developement of the data collection part and partly for the predictive analysis. Data collection included system and application utilization of system resouces like CPU, memory and swap at any point in time in operatings systems like Linux, Solaris and AIX. Used exponentiation algorithms for the predictive analysis including usage and the time into consideration for better prediction",
			content:[
				//{sub:"", img:"1.png", desc:"This is "}
			]
		},
		{img:"symantec.png", desc:"a Symantec's Application HA product feature to support failover of VMs in IBM's power virtualization environment", heading:"application HA", folder:"bugspies", name:"HA in IBM LPARs", link:"",
			skills:[ skill.prl, skill.nix ],
			about:"This feature facilitated the high availability of virtual machines by virtue of setting up of a private VLAN between the hypervisor and the virtual machines that are configured for failover. This also meant addition and deletion of new virtual machines to the existing setup dynamically without downtime.",
			role:"Involved completely in the networking aspect of the feature, including the automation of addition and deletion of virtual network adapters at run time, private VLAN setup, configuration and start/stop of DHCP servers and clients, supporting Live partition mobility of LPARs(IBM virtual machines) with this feature.",
			content:[
				//{sub:"", img:"1.png", desc:"This is "}
			]
		},
		{img:"accept.png", desc:"a bridge between the AGILE requirments management tool ACCEPT 360 and an internal feature tracking tool.", heading:"accept bridge", folder:"bugspies", name:"Accept 360 Bridge", link:"",
			skills:[ skill.php, skill.apc, skill.jvs, skill.htm ],
			about:"This tool helped the AGILE program management team to create, delete, track and  manage sub stories for a main ACCEPT 360 requirement using the internal feature tracking tool. This enhanced the bridge between ACCEPT and tracking tool there by eliminating the requirment and cost of more ACCEPT licenses for sub story tracking.",
			role:"Designed, developed and created a new bridge portal which automated management of substories for each main requirement in ACCEPT 360 portal using the internal feature tracking tool. Studied the DB schema of the internal tracking tool to accommodate the new translation of information in the new bridge between the two tools.",
			content:[
				//{sub:"", img:"1.png", desc:"This is "}
			]
		},
		{img:"bugspies.png", desc:"a tool to show file and function wise hot spots in your code", heading:"bugspies", folder:"bugspies", name:"bugspies", link:"",
			skills:[ skill.njs, skill.ejs, skill.pyt, skill.htm, skill.jde, skill.mql, skill.ajs, skill.jqy, skill.les ],
			about:"This internal tool was developed as part of a hackathon event, which shows the parts of the code which have been vulnerable to bugs over the years. This tool churns the company's customer escalation data and the corresponding bug fixes that have gone over the years to generate more usable data. A neat and clean UI was developed on top of the usable data to show the various spots at file level and at function level inside files for various products across the company.",
			role:"In a team of 4, developed the data collection scripts to generate data from the company's customer escalation database, enhanced the heuristics in the existing bug spotting utilities, applying and comparing various products across the company, developed the UI to display them. Involved in all the aspects, but primarily on the front end side of this tool. Used statistical javascript libraries including bar, line and pie charts, source tree visualization, queriable data tables and integrated with the NEO4j graph database front end with the tool to provide a more graphical representaion of developers worked in various bug fixes over the years.",
			content:[
				//{sub:"", img:"1.png", desc:"This is "}
			]
		}
	];
	var exportVariable = {
		pages: [
			{page:0, bg:"clouds", name:"home", fa:"home", icon:"home"},
			{page:1, bg:"emerald", name:"skills", fa:"star", icon:"star"},
			{page:6, bg:"peterRiver", name:"work", fa:"code", icon:"tasks"},
			{page:2, bg:"metroYellow", name:"projects", fa:"desktop", icon:"tasks"},
			{page:4, bg:"metroOrange", name:"awards", fa:"trophy", icon:"certificate"},
			{page:3, bg:"metroCyan", name:"about", fa:"info-circle", icon:"info-sign"},
			{page:7, bg:"sunFlower", name:"gallery", fa:"image", icon:"earphone"},
			{page:5, bg:"sunFlower", name:"contact", fa:"phone", icon:"earphone"},
		],
		superSet : [
			{bg:"#333333", invert:fals_var, skills:[ skill.ccc, skill.cpp, skill.jvs, skill.htm, skill.pyt, skill.prl, skill.php ], image:"coding", name:"Languages"},
			{bg:"#008A01", invert:fals_var, skills:[ skill.njs, skill.ejs, skill.bsf, skill.fsk, skill.apc, skill.sio, skill.rmq ], image:"server-side", name:"Back-End"},
			{bg:"#FF9E3D", invert:true_var, skills:[ skill.ajs, skill.bjs, skill.jqy, skill.jde, skill.jin ], image:"front-end", name:"Front-End"},
			{bg:"#666699", invert:fals_var,	skills:[ skill.sql, skill.mql, skill.mdb ], image:"db", name:"Databases"},
			{bg:"#FFB319", invert:true_var,	skills:[ skill.css, skill.les, skill.psp, skill.btp ], image:"ux2", name:"UI/UX"},
			{bg:"#DE664A", invert:fals_var,	skills:[ skill.git, skill.vim, skill.ubu, skill.nix, skill.win, skill.mac ], image:"tools", name:"General"},
			//{bg:"#3587D4", invert:true_var,	skills:[ skill.ubu, skill.nix, skill.win, skill.mac ], image:"general", name:"OS"},
		],
		interests : [
			{invert:fals_var,	name:"Gator", image:"gator3", col:4, bg:"metroGreen", desc:"graduated from Florida, Gainesville (2010) with Masters degree in computer engineering"},
			{invert:true_var,	name:"Symantec", image:"symantec", col:4, bg:"metroYellow", desc:"been working at Symantec Corp. Mountain View, CA for almost 4 years now"},
			{invert:fals_var,	name:"Soccer", image:"soccer2", col:4, bg:"peterRiver", desc:"a huge soccer buff, won't miss out on a chance to play on any occasion either for real or on my PS3"},
			{invert:true_var,	name:"Real Madrid", image:"madrid", col:4, bg:"sunFlower", desc:"a die-hard fan of Real Madrid C.F, almost follow them religiously"},
			{invert:true_var,	name:"Ninja", image:"kawasaki", col:6, bg:"limeGreen", desc:"enjoy the ride on my kawasaki ninja 650r once in a while"},
			{invert:fals_var,	name:"Food", image:"food", col:4, bg:"alizarin", desc:"a vegetarian, won't call myself a foodie but still like italian, mexican and indian food"},
			//{invert:fals_var,	name:"FIFA", image:"fifa2", col:4, bg:"alizarin", desc:"don't do bad either and compete in the virtual spectrum of the beautiful game of soccer"},
			{invert:fals_var,	name:"Techie", image:"tech", col:6, bg:"belizeHole", desc:"up to date with all the stuff going on in the tech and gadget world"},
			{invert:true_var,	name:"Music", image:"music", col:4, bg:"orange", desc:"will just listen to any song, any genre, any language which is good"},
			{invert:fals_var,	name:"Coder", image:"coding", col:4, bg:"metroRed", desc:"like to experiment with code, end up pretty much coding all the time"}
		],
		projects : project_content,
		works: work_content
	};
	for (var i in exportVariable.interests) {
		exportVariable.interests[i].index = i;
	}
	return exportVariable;
};
