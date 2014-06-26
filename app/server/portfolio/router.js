module.exports = function (app, module_obj) {
	var CT = module_obj.CT;
	var AM = module_obj.AM;
	var EM = module_obj.EM;
	var unirest = require('unirest');
	var fifaToISO = {
		BRA:"br",
		NED:"nl",
		AUS:"au",
		ESP:"es",
		CHI:"cl",
		CRO:"hr",
		CMR:"cm",
		COL:"co",
		MEX:"mx",
		CIV:"ci",
		ENG:"gb",
		URU:"uy",
		GRE:"gr",
		JPN:"jp",
		ITA:"it",
		CRC:"cr",
		FRA:"fr",
		SUI:"ch",
		ECU:"ec",
		HON:"hn",
		IRN:"iran",
		ARG:"ar",
		GER:"de",
		GHA:"gh",
		NGA:"ne",
		BIH:"ba",
		BEL:"be",
		RUS:"ru",
		POR:"pt",
		USA:"us",
		ALG:"dz",
		KOR:"kr"
	};

	var skills = [
		{bg:"#f0db4f", invert:true,		name:"JavaScript",	image:"javascript",	points:["", "", ""]	},
		{bg:"#85CD2B", invert:true,		name:"Node JS",		image:"node",		points:["", "", ""]	},
//		{bg:"#f1db52", invert:true,		name:"express",		image:"expressjs",	points:["", "", ""]	},
		{bg:"#E52C3C", invert:true,		name:"Angular JS",	image:"angular",	points:["", "", ""]	},
		{bg:"#ECF0F1", invert:true,		name:"Python",		image:"python",		points:["", "", ""]	},
		{bg:"#6182b8", invert:true,		name:"Php",			image:"php",		points:["", "", ""]	},
//		{bg:"#aad959", invert:true,		name:"SocketIO",	image:"socketio",	points:["", "", ""]	},
		{bg:"#2c596e", invert:false,	name:"MySQL",		image:"mysql",		points:["", "", ""]	},
		{bg:"#82c564", invert:true,		name:"mongoDB",		image:"mongo",		points:["", "", ""]	},
//		{bg:"#67cc9a", invert:true,		name:"Jade",		image:"jade",		points:["", "", ""]	},
		{bg:"#223553", invert:false,	name:"Less",		image:"less",		points:["", "", ""]	},
		{bg:"#2d143e", invert:false,	name:"Bootstrap",	image:"bootstrap",	points:["", "", ""]	},
//		{bg:"#c1392b", invert:false,	name:"Linux",		image:"ubuntu",		points:["", "", ""]	},
		{bg:"#f0652c", invert:false,	name:"HTML5",		image:"html5",		points:["", "", ""]	},
//		{bg:"#4e4e4e", invert:true,		name:"Vim",			image:"vim",		points:["", "", ""]	},
		{bg:"#96cafe", invert:true,		name:"PhotoShop",	image:"photoshop",	points:["", "", ""]	},
		{bg:"#347cb3", invert:true,		name:"jQuery",		image:"jquery",		points:["", "", ""]	}
	];

	var interests = [
		{invert:true,	name:"I love tech", index:0, image:"tech", col:6, bg:"belizeHole", points:["", "", ""]},
		{invert:false,	name:"A Gator", index:1, image:"gator3", col:4, bg:"metroGreen", points:["", "", ""]},
		{invert:true,	name:"Symantec", index:2, image:"symantec", col:4, bg:"metroYellow", points:["", "", ""]},
		{invert:true,	name:"Ninja !!!", index:3, image:"kawasaki", col:6, bg:"limeGreen	", points:["", "", ""]},
		{invert:true,	name:"Soccer", index:4, image:"soccer2", col:4, bg:"peterRiver", points:["", "", ""]},
		{invert:true,	name:"Real Madrid", index:5, image:"madrid", col:4, bg:"sunFlower", points:["", "", ""]},
		{invert:false,	name:"FIFA", image:"fifa2", index:6, col:4, bg:"alizarin", points:["", "", ""]},
		{invert:true,	name:"Music", image:"music", index:7, col:4, bg:"orange", points:["", "", ""]}
	];

	var projects = [
		{name:"game-room"},
		{name:"cool-git-stats"},
		{name:"gatoraze-dot-com"},
		{name:"dollaraze"},
		{name:"bug-spies"},
		{name:"raze-tube"}
	];
	var groupIdtoLetter = ["", "A", "B", "C", "D", "E", "F", "G", "H"];
	var groups = { A:[], B:[], C:[], D:[], E:[], F:[], G:[], H:[] };
	//.headers({ 'Accept': 'application/json' })
	unirest.get('http://worldcup.sfg.io/teams/').send().end(function (response) {
		var teams = response.body;
		for (var x in teams) {
			teams[x].country_code = fifaToISO[teams[x].fifa_code];
			groups[groupIdtoLetter[teams[x].group_id]].push(teams[x]);
		}
		//console.log(groups);
	});

	app.get('/portfolio', function(req, res){
		res.render('portfolio/views/home', {title: 'Manjunath', projects:projects, skillSet:skills, total: 5, interests:interests});
	});
	app.post('/portfolio', function(req, res){
		res.send({data:""}, 200);
	});
	app.get('/worldcup', function(req, res){
		res.render('portfolio/views/fifa', {title: 'FIFA WC', groups:groups});
	});
};
