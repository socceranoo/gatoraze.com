module.exports = function (app, module_obj, secret_var) {
	var CT = module_obj.CT;
	var AM = module_obj.AM;
	var EM = module_obj.EM;
	var PF = require('./variables.js')();
	function render (req, res, current){
		res.render('portfolio/views/home', {current:current, title: 'portfolio', works:PF.works, projects:PF.projects, superSet:PF.superSet, pages:PF.pages, total: PF.pages.length, interests:PF.interests});
	}
	app.get('/passcode', function(req, res){
		res.render('account/views/passcode', { title: 'Enter passcode'});
	});

	app.post('/passcode', function(req, res){
		var secret = req.param('entry_key');
		if (secret == secret_var.secret) {
			res.cookie('entry_key', secret);
			res.redirect('/portfolio');
		} else {
			res.redirect('/passcode');
		}
	});

	app.get('/clearpasscode', function(req, res){
		res.clearCookie('entry_key');
		req.session.destroy( function(e) {
			res.redirect('/passcode');
		});
	});

	app.all('/portfolio', function(req, res, next){
		if (!check_for_entry_key(req)) {
			res.clearCookie('entry_key');
			res.redirect('/passcode');
			return;
		} else {
			next();
		}
	});

	var check_for_entry_key = function (req) {
		if (req.cookies.entry_key === undefined){
			return false;
		}
		if (req.cookies.entry_key == secret_var.secret) {
			req.session.entry_key = req.cookies.entry_key;
			return true;
		}
		return false;
	};
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
