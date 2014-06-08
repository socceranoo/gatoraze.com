module.exports = function (app, module_obj) {
	var CT = module_obj.CT;
	var AM = module_obj.AM;
	var EM = module_obj.EM;

	var skills = [
		{bg:"#f0db4f", invert:true,		name:"JavaScript",	image:"javascript",	points:["", "", ""]	},
		{bg:"#85CD2B", invert:true,		name:"Node JS",		image:"node",		points:["", "", ""]	},
//		{bg:"#f1db52", invert:true,		name:"express",		image:"expressjs",	points:["", "", ""]	},
		{bg:"#E52C3C", invert:false,	name:"Angular JS",	image:"angular",	points:["", "", ""]	},
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
		{name:"Symantec", image:"symantec", col:4, bg:"metroRed", points:["", "", ""]},
		{name:"A Gator", image:"gator", col:4, bg:"metroYellow", points:["", "", ""]},
		{name:"Soccer", image:"soccer", col:4, bg:"metroNavy", points:["", "", ""]},
		{name:"I love tech", image:"workout", col:6, bg:"metroPurple", points:["", "", ""]},
		{name:"Ninja !!!", image:"ninja", col:6, bg:"metroJade", points:["", "", ""]},
		{name:"Real Madrid", image:"madrid", col:4, bg:"metroOrange", points:["", "", ""]},
		{name:"FIFA", image:"fifa2", col:4, bg:"metroCyan", points:["", "", ""]},
		{name:"Music", image:"music", col:4, bg:"metroMagenta", points:["", "", ""]}
	];

	var projects = [
		{name:"game-room"},
		{name:"cool-git-stats"},
		{name:"gatoraze-dot-com"},
		{name:"dollaraze"},
		{name:"bug-spies"},
		{name:"raze-tube"}
	];

	app.get('/portfolio', function(req, res){
		res.render('portfolio/views/home', {title: 'Manjunath', projects:projects, skillSet:skills, total: 5, interests:interests});
	});
	app.post('/portfolio', function(req, res){
		res.send({data:""}, 200);
	});
};
