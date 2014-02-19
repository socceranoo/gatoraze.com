var crypto		= require('crypto');
var moment		= require('moment');
var Bookshelf	= require('bookshelf');

/* establish the database connection */

var MySql = Bookshelf.initialize({
	client: 'mysql',
	connection: {
		host     : 'localhost',
		user     : 'root',
		password : 'Orange',
		database : 'Main',
		charset  : 'utf8'
	}
});

var accounts = MySql.Model.extend({
	tableName: 'nodeuser'
});
var accountSet = MySql.Collection.extend({
	tableName: 'nodeuser'
});

/* login validation methods */
exports.autoLogin = function(user, pass, callback)
{
	new accounts({'user' : user}).fetch().then(function(o) {
		if (o){
			var obj = o.toJSON({shallow:true});
			if (obj.pass == pass) {
				callback(obj);
			} else {
				callback(null);
			}
		} else{
			callback(null);
		}
	});
};

exports.manualLogin = function(user, pass, callback)
{
	new accounts({user : user, pass: md5(pass)}).fetch().then(function(o) {
		if (o === null){
			callback('user-not-found or invalid-password');
		} else{
			var obj = o.toJSON({shallow:true});
			callback(null, obj);
		}
	});
};

/* record insertion, update & deletion methods */

exports.addNewAccount = function(newData, callback)
{
	new accounts({user : newData.user}).fetch().then(function(o) {
		if (o){
			callback('username-taken');
		} else{
			new accounts({email : newData.email}).fetch().then(function(o) {
				if (o){
					callback('email-taken');
				} else{
					newData.pass = md5(newData.pass);
					// append date stamp when record was created //
					//newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
					new accounts(newData).save().then(function(model) {
						callback();
					});
				}
			});
		}
	});
};

exports.updateAccount = function(newData, callback)
{
	var updateData = {
		name:newData.name,
		email:newData.email,
		country:newData.country,
		nickname:newData.nickname
	};
	new accounts({user : newData.user}).fetch().then(function (model) {
		if (model) {
			if (newData.pass !== ''){
				updateData.pass = md5(newData.pass);
			}
			model.save(updateData, {patch:true}).then(function(o) {
				callback(null, o.toJSON({shallow:true}));
			});
		} else { 
			callback(true);
		}
	});
};

exports.updatePassword = function(email, newPass, callback)
{
	new accounts({email : email}).fetch().then(function (model) {
		if (model) {
			model.save({pass:md5(newPass)}, {patch:true}).then(function(o) {
				callback(null, o.toJSON({shallow:true}));
			});
		} else { 
			callback(true, null);
		}
	});
};

/* account lookup methods */

exports.deleteAccount = function(id, callback)
{
	//accounts.remove({_id: getObjectId(id)}, callback);
};

exports.getAccountByEmail = function(email, callback)
{
	new accounts({email : email}).fetch().then(function(model) {
		if (model){
			callback(model.toJSON({shallow:true}));
		} else{
			callback(null);
		}
	});
};

exports.validateResetLink = function(email, passHash, callback)
{
	new accounts({email : email, pass:passHash}).fetch().then(function(model) {
		if (model){
			callback('ok');
		} else{
			callback(null);
		}
	});
};

exports.getAllRecords = function(callback)
{
	new accountSet().fetch().then(function (collection) {
		if (collection) {
			//console.log(collection.toJSON({shallow:true}));
			//console.log(JSON.stringify(collection));
			callback(null, collection.toJSON({shallow:true}));
		} else 
			callback(null, []);
	});
};

exports.delAllRecords = function(callback)
{
	//accounts.remove({}, callback); // reset accounts collection for testing //
	callback();
};

/* private encryption & validation methods */
var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
};
