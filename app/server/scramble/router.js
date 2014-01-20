module.exports = function(app, module_obj) {
	app.get('/scramble', function(req, res){
		res.render('scramble/views/home', { title: 'Hello - Please Login To Your Account' });
	});
	app.get('/scramble/route1', function(req, res){
		res.render('scramble/views/success', { title: 'Hello - Please Login To Your Account' });
	});
};
