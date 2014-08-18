module.exports = function (app, module_obj) {
	var CT = module_obj.CT;
	var AM = module_obj.AM;
	var EM = module_obj.EM;
	var true_var = true;
	var fals_var = false;

	var skill_jvs = {click:true_var,	bg:"#f0db4f", invert:true_var,	name:"JavaScript",	image:"javascript",	points:["", "", ""]	};
	var skill_njs = {click:true_var,	bg:"#85CD2B", invert:true_var,	name:"Node JS",		image:"node",		points:["", "", ""]	};
	var skill_ajs = {click:true_var,	bg:"#E52C3C", invert:fals_var,	name:"Angular JS",	image:"angular",	points:["", "", ""]	};
	var skill_bjs = {click:true_var,	bg:"#f5f5f5", invert:true_var,	name:"Backbone JS",	image:"backbone",	points:["", "", ""]	};
	var skill_pyt = {click:true_var,	bg:"#ECF0F1", invert:true_var,	name:"Python",		image:"python",		points:["", "", ""]	};
	var skill_fsk = {click:true_var,	bg:"#FFFFFF", invert:true_var,	name:"Flask",		image:"flask",		points:["", "", ""]	};
	var skill_php = {click:true_var,	bg:"#6182b8", invert:true_var,	name:"Php",			image:"php",		points:["", "", ""]	};
	var skill_sql = {click:true_var,	bg:"#2c596e", invert:fals_var,	name:"MySQL",		image:"mysql",		points:["", "", ""]	};
	var skill_mdb = {click:true_var,	bg:"#82c564", invert:true_var,	name:"mongoDB",		image:"mongo",		points:["", "", ""]	};
	var skill_les = {click:true_var,	bg:"#223553", invert:fals_var,	name:"Less",		image:"less",		points:["", "", ""]	};
	var skill_btp = {click:true_var,	bg:"#2d143e", invert:fals_var,	name:"Bootstrap",	image:"bootstrap",	points:["", "", ""]	};
	var skill_htm = {click:true_var,	bg:"#f0652c", invert:fals_var,	name:"HTML5",		image:"html5",		points:["", "", ""]	};
	var skill_psp = {click:true_var,	bg:"#96cafe", invert:true_var,	name:"PhotoShop",	image:"photoshop",	points:["", "", ""]	};
	var skill_jqy = {click:true_var,	bg:"#347cb3", invert:fals_var,	name:"jQuery",		image:"jquery",		points:["", "", ""]	};
	var skill_ejs = {click:true_var,	bg:"#f1db52", invert:true_var,	name:"express",		image:"expressjs",	points:["", "", ""]	};
	var skill_sio = {click:true_var,	bg:"#aad959", invert:true_var,	name:"SocketIO",	image:"socketio",	points:["", "", ""]	};
	var skill_jde = {click:true_var,	bg:"#67cc9a", invert:true_var,	name:"Jade",		image:"jade",		points:["", "", ""]	};
	var skill_jin = {click:true_var,	bg:"#ffffff", invert:true_var,	name:"Jinja",		image:"jinja",		points:["", "", ""]	};
	var skill_vim = {click:fals_var,	bg:"#4e4e4e", invert:true_var,	name:"Vim",			image:"vim",		points:["", "", ""]	};
	var skill_ubu = {click:fals_var,	bg:"#c1392b", invert:fals_var,	name:"Linux",		image:"linux",		points:["", "", ""]	};
	var skill_win = {click:fals_var,	bg:"#c1392b", invert:fals_var,	name:"Windows",		image:"windows",	points:["", "", ""]	};
	var skill_mac = {click:fals_var,	bg:"#c1392b", invert:fals_var,	name:"MacOS",		image:"mac",		points:["", "", ""]	};
	var skill_nix = {click:fals_var,	bg:"#c1392b", invert:fals_var,	name:"Unix",		image:"ubuntu",		points:["", "", ""]	};

	var superSet = [
		{bg:"#91A6A1", invert:fals_var, skills:[ skill_njs, skill_ejs, skill_pyt, skill_fsk, skill_php, skill_sio ], image:"server-side", name:"Server-side"},
		{bg:"#7cb1e6", invert:true_var, skills:[ skill_ajs, skill_bjs, skill_jde, skill_les, skill_jin, skill_jqy ], image:"front-end", name:"Front-End"},
		{bg:"#2AB3BE", invert:true_var,	skills:[ skill_htm, skill_psp, skill_btp ], image:"ux", name:"UI/UX"},
		{bg:"#FF8C01", invert:true_var,	skills:[ skill_sql, skill_mdb ], image:"db", name:"Databases"},
		{bg:"#FCD209", invert:true_var,	skills:[ skill_ubu, skill_win, skill_mac, skill_vim ], image:"general", name:"General"}
	];

	var interests = [
		{invert:fals_var,	name:"I love tech", index:0, image:"tech", col:6, bg:"belizeHole", points:["", "", ""]},
		{invert:fals_var,	name:"A Gator", index:1, image:"gator3", col:4, bg:"metroGreen", points:["", "", ""]},
		{invert:true_var,	name:"Symantec", index:2, image:"symantec", col:4, bg:"metroYellow", points:["", "", ""]},
		{invert:true_var,	name:"Ninja !!!", index:3, image:"kawasaki", col:6, bg:"limeGreen	", points:["", "", ""]},
		{invert:fals_var,	name:"Soccer", index:4, image:"soccer2", col:4, bg:"peterRiver", points:["", "", ""]},
		{invert:true_var,	name:"Real Madrid", index:5, image:"madrid", col:4, bg:"sunFlower", points:["", "", ""]},
		{invert:fals_var,	name:"FIFA", image:"fifa2", index:6, col:4, bg:"alizarin", points:["", "", ""]},
		{invert:true_var,	name:"Music", image:"music", index:7, col:4, bg:"orange", points:["", "", ""]}
	];

	var projects = [
		{name:"game-room"},
		{name:"cool-git-stats"},
		{name:"gatoraze-dot-com"},
		{name:"dollaraze"},
		{name:"bug-spies"},
		{name:"Priyanka's Portfolio"},
		{name:"raze-tube"}
	];

	app.get('/portfolio', function(req, res){
		res.render('portfolio/views/home', {title: 'Manjunath', projects:projects, superSet:superSet, total: 6, interests:interests});
	});
	app.post('/portfolio', function(req, res){
		res.send({data:""}, 200);
	});

	var unirest = require('unirest');
	var fifaToISO = {
		BRA:"br", NED:"nl", AUS:"au", ESP:"es", CHI:"cl", CRO:"hr", CMR:"cm", COL:"co",
		MEX:"mx", CIV:"ci", ENG:"gb", URU:"uy", GRE:"gr", JPN:"jp", ITA:"it", CRC:"cr",
		FRA:"fr", SUI:"ch", ECU:"ec", HON:"hn", IRN:"iran", ARG:"ar", GER:"de", GHA:"gh",
		NGA:"ne", BIH:"ba", BEL:"be", RUS:"ru", POR:"pt", USA:"us", ALG:"dz", KOR:"kr"
	};
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
	app.get('/worldcup', function(req, res){
		res.render('portfolio/views/fifa', {title: 'FIFA WC', groups:groups});
	});
};
