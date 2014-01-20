module.exports = function (app, module_obj) {
	var CT = module_obj.CT;
	var AM = module_obj.AM;
	var EM = module_obj.EM;
// main login page //
	
	app.get('/', function(req, res){
		// check if the user's credentials are saved in a cookie //
		if (req.cookies.user === undefined || req.cookies.pass === undefined){
			res.render('account/views/login', { title: 'Hello - Please Login To Your Account' });
			return;
		}
		// attempt automatic login //
		AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
			if (o !== null){
				req.session.user = o;
				res.redirect('/home');
			}	else{
				res.render('account/views/login', { title: 'Hello - Please Login To Your Account' });
			}
		});
	});
	
	app.post('/', function(req, res){
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
				o.url = module_obj.url;
				req.session.user = o;
				res.cookie('user', o.user, { maxAge: 900000 });
				res.cookie('pass', o.pass, { maxAge: 900000 });
				res.send(o, 200);
				module_obj.url='';
			}
		});
	});
	
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		res.render('account/views/signup', {  title: 'Signup', countries : CT });
	});
	
	app.post('/signup', function(req, res){
		var userData = {
			name	: req.param('name'),
			email	: req.param('email'),
			user	: req.param('user'),
			pass	: req.param('pass'),
			nickname: req.param('nickname'),
			country : req.param('country')
		};
		console.log(JSON.stringify(userData));
		AM.addNewAccount(userData, function(e){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
			}
		});
	});


// password reset //
	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (var k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query.e;
		var passH = req.query.p;
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('account/views/reset', { title : 'Reset Password' });
			}
		});
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('unable to update password', 400);
			}
		});
	});
	
	app.all('*', function(req, res, next){
		var url = require('url');
		var urlObj = url.parse(req.url, true);
		var pathname = urlObj.pathname;
		if (req.cookies.user === undefined || req.cookies.pass === undefined){
			//module_obj.url = pathname;
			res.redirect('/');
		} else {
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o !== null){
					req.session.user = o;
					next();
				} else {
					//module_obj.url = pathname;
					res.redirect('/');
				}
			});
		}
	});

// logged-in user homepage //
	
	app.get('/home', function(req, res) {
		res.render('account/views/home', {
			title : 'Control Panel',
			countries : CT,
			udata : req.session.user
		});
	});
	
	app.post('/home', function(req, res){
		if (req.param('user') !== undefined) {
			AM.updateAccount({
				user		: req.param('user'),
				name		: req.param('name'),
				nickname	: req.param('nickname'),
				email		: req.param('email'),
				country		: req.param('country'),
				pass		: req.param('pass')
			}, function(e, o){
				if (e){
					res.send('error-updating-account', 400);
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user !== undefined && req.cookies.pass !== undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
				}
			});
		}	else if (req.param('logout') == 'true'){
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.send('ok', 200); });
		}
	});
	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('account/views/print', { title : 'Account List', accts : accounts });
		});
	});
	
	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
				req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
		});
	});
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
	
	//app.get('*', function(req, res) { res.render('account/views/404', { title: 'Page Not Found'}); });
	
};
