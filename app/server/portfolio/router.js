module.exports = function (app, module_obj) {
	var CT = module_obj.CT;
	var AM = module_obj.AM;
	var EM = module_obj.EM;

	var skills = [
		{name:"Node JS", image:"node"},
		{name:"express", image:"expressjs"},
		{name:"Angular JS", image:"angular"},
		{name:"Python", image:"python"},
		//{name:"SocketIO", image:"socketio"},
		{name:"MySQL", image:"mysql"},
		{name:"Php", image:"php"},
		{name:"mongoDB", image:"mongo"},
		//{name:"Jade", image:"jade"},
		{name:"Less", image:"less"},
		{name:"Bootstrap", image:"bootstrap"},
		{name:"Linux, MAC and Windows", image:"ubuntu"},
		{name:"HTML5", image:"html5"},
		//{name:"Vim", image:"vim"},
		//{name:"JavaScript", image:"javascript"},
		//{name:"PhotoShop", image:"photoshop"},
		{name:"jQuery", image:"jquery"}
	];

	var interests = [
		{name:"Symantec", image:"symantec", col:4, bg:"metroRed"},
		{name:"Gator", image:"gator", col:4, bg:"metroNavy"},
		{name:"Soccer", image:"soccer", col:4, bg:"metroYellow"},
		{name:"Work out", image:"workout", col:6, bg:"metroPurple"},
		{name:"Ninja 650", image:"ninja", col:6, bg:"asbestos"},
		{name:"Real Madrid", image:"madrid", col:4, bg:"metroOrange"},
		{name:"Myself", image:"pofile", col:4, bg:"peterRiver"},
		{name:"Music", image:"music", col:4, bg:"metroMagenta"}
	];
	
	app.get('/portfolio', function(req, res){
		res.render('portfolio/views/home', {title: 'Manjunath', skillSet:skills, total: 5, aboutMe:interests});
	});
};
