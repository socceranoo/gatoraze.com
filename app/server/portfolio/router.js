module.exports = function (app, module_obj) {
	var CT = module_obj.CT;
	var AM = module_obj.AM;
	var EM = module_obj.EM;
	var PF = require('./variables.js')();

	app.get('/portfolio', function(req, res){
		res.render('portfolio/views/home', {title: 'portfolio', works:PF.works, projects:PF.projects, superSet:PF.superSet, pages:PF.pages, total: PF.pages.length, interests:PF.interests});
	});
	app.post('/portfolio', function(req, res){
		res.send({data:""}, 200);
	});
};
