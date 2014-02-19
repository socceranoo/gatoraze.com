module.exports = function(app, module_obj) {
	var AM = module_obj.AM;
	var MM = module_obj.MM;
	var EM = module_obj.EM;
	var site = "Dollaraze";
	app.get('/money', function(req, res){
		MM.showSummary(req, AM.lookUpUser, function(o) {
			res.render('money/views/home', {site:site, title: site+' - home', friends:o.friends, arg:o.arg});
		});
	});

	app.get('/money/summary', function(req, res){
		MM.showSummary(req, AM.lookUpUser, function(o) {
			res.render('money/views/home', {site:site, title: site+' - home', friends:o.friends, arg:o.arg});
		});
	});

	app.get('/money/friend', function(req, res){
		MM.showSummary(req, AM.lookUpUser, function(o) {
			res.render('money/views/friend', {site:site, title: site+' - add friends', friends:o.friends, arg:o.arg});
		});
	});
	app.post('/money/friend', function(req, res){
		var array = req.param('friends');
		console.log(array);
		MM.addFriends(array, req, AM.lookUpUser, function(o) {
			res.send(o, 200);
		});
	});

	app.get('/money/bill', function(req, res){
		var id = req.query.id;
		var title = (!id) ? site+" - add Bill": site+"- edit bill";
		id = (id) ? id: -1;
		MM.editOrNewBill(req, AM.lookUpUser, id, function(o, authorized) {
			res.render('money/views/addbill', {site:site, authorized:authorized, title: title, friends:o.friends, arg:o.arg});
		});
	});
	app.post('/money/bill', function(req, res){
		var billObj = req.param('bill');
		MM.addEditBill(billObj, req, AM.lookUpUser, function(result) {
			res.send(result, 200);
		});
	});

	app.get('/money/revive', function(req, res){
		var id = req.query.id;
		MM.reviveDeleteBill(req.session.user.user, {current:'false', id:id}, false, function(newid) {
			res.redirect('/money/details?current=true&id='+newid);
		});
	});

	app.get('/money/delete', function(req, res){
		var id = req.query.id;
		MM.reviveDeleteBill(req.session.user.user, {current:'true', id:id}, false, function(newid) {
			res.redirect('/money/details?current=false&id='+newid);
		});
	});

	app.get('/money/bills', function(req, res){
		var user2 = req.query.user;
		MM.showAllBills({current:true, user2:user2}, req, AM.lookUpUser, function(o) {
			res.render('money/views/bills', {site:site, title: site+' - bills', friends:o.friends, arg:o.arg});
		});
	});

	app.get('/money/oldbills', function(req, res){
		MM.showAllBills({current:false, user2:null}, req, AM.lookUpUser, function(o) {
			res.render('money/views/bills', {site:site, title: site+' - deleted bills', friends:o.friends, arg:o.arg});
		});
	});

	app.get('/money/details', function(req, res){
		var id = req.query.id;
		var current = req.query.current;
		MM.showBillDetails({id:id, current:current}, req, AM.lookUpUser, function(o, authorized) {
			res.render('money/views/viewbill', {site:site, authorized:authorized, title: site+" - view bill", friends:o.friends, arg:o.arg});
		});
	});
};
