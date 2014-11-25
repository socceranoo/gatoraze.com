module.exports = function (app, module_obj) {
	var CT = module_obj.CT;
	var AM = module_obj.AM;
	var EM = module_obj.EM;
	var WC = require('./world-cup.js')();
	var NFL = require('./nfl.js')();

	app.get('/fifa', function(req, res){
		res.render('sports/views/fifa', {title: 'FIFA WC', groups:WC.groups});
	});

	app.get('/nfl', function(req, res){
		res.render('sports/views/nfl', {title: 'nfl', categories:NFL.categories, teams:NFL.teams, images:NFL.images});
	});

	app.post('/nfl-roster', function(req, res) {
		var team = req.param('team');
		var roster = NFL.getRoster(team);
		//console.log(roster);
		//console.log(data);
		NFL.getLeaders(10, team, function (data) {
			res.send({roster:roster, leaders:data}, 200);
		});
	});
	app.post('/nfl-init', function(req, res) {
		NFL.getData(function (data) {
			res.send(data, 200);
		});
	});
};
