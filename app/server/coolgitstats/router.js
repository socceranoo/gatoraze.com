module.exports = function (app, module_obj) {
	var CT = module_obj.CT;
	var AM = module_obj.AM;
	var EM = module_obj.EM;
	var util = require('util');
	var fs = require('fs');
	var exec = require('child_process').exec;
	var path = "/gitstats/data/";
	var fileArr = fs.readdirSync(path);
	var data = {};
	fileArr.forEach(function (elem, index, array) {
		var filename = elem;
		var temp = filename.split('.');
		if (temp.length == 2 && temp[1] == "data") {
			fs.readFile(path+filename, "utf-8", function (err, content) {
				data[temp[0]] = JSON.parse(content);
			});
		}
	});

	app.get('/coolgitstats', function(req, res){
		res.render('coolgitstats/views/home', {title: 'coolgitstats', repos:Object.keys(data)});
	});

	app.get('/coolgitstats/:project/:page?', function(req, res){
		var project = (req.params.project) ? req.params.project : null;
		var page = (req.params.page) ? req.params.page : "summary";
		if (project !== null && data[project] && data[project][page]) {
			var navObj = {"summary":false, "activity":false, "authors":false, "files":false, "tags":false};
			navObj[page] = true;
			res.render('coolgitstats/views/'+page, {title: 'coolgitstats', name:project, page:page, data:data[project][page], nav:navObj});
		} else {
			console.log(req.params.project);
			res.redirect('/coolgitstats');
		}
	});
};
