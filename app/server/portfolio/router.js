module.exports = function (app, module_obj) {
	var CT = module_obj.CT;
	var AM = module_obj.AM;
	var EM = module_obj.EM;
	var PF = require('./variables.js')();
	var WC = require('./world-cup.js')();

	app.get('/portfolio', function(req, res){
		res.render('portfolio/views/home', {title: 'portfolio', projects:PF.projects, superSet:PF.superSet, pages:PF.pages, total: PF.pages.length, interests:PF.interests});
	});
	app.post('/portfolio', function(req, res){
		res.send({data:""}, 200);
	});

	app.get('/worldcup', function(req, res){
		res.render('portfolio/views/fifa', {title: 'FIFA WC', groups:WC.groups});
	});
};
