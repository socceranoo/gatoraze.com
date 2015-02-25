module.exports = function (app, module_obj) {
	var CT = module_obj.CT;
	var AM = module_obj.AM;
	var EM = module_obj.EM;
	var PF = require('./variables.js')();
	function render (req, res, current){
		res.render('portfolio/views/home', {current:current, title: 'portfolio', works:PF.works, projects:PF.projects, superSet:PF.superSet, pages:PF.pages, total: PF.pages.length, interests:PF.interests});
	}
	app.get('/portfolio', function(req, res) {
		render(req, res, 0);
	});
	app.get('/portfolio/home', function(req, res) {
		render(req, res, 0);
	});
	app.get('/portfolio/skills', function(req, res) {
		render(req, res, 1);
	});
	app.get('/portfolio/work', function(req, res) {
		render(req, res, 6);
	});
	app.get('/portfolio/projects', function(req, res) {
		render(req, res, 2);
	});
	app.get('/portfolio/awards', function(req, res) {
		render(req, res, 3);
	});
	app.get('/portfolio/about', function(req, res) {
		render(req, res, 4);
	});
	app.get('/portfolio/contact', function(req, res) {
		render(req, res, 5);
	});
	app.get('/portfolio/gallery', function(req, res) {
		render(req, res, 7);
	});
	app.post('/portfolio', function(req, res){
		res.send({data:""}, 200);
	});
};
