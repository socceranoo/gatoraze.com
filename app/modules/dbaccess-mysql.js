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

exports.accountManager = require('./account-table')(MySql);
exports.moneyManager = require('./money-table')(MySql);
