var ES = require('./email-settings');
var EM = {};
module.exports = EM;

EM.server = require("emailjs/email").server.connect({

	host		: ES.host,
	user		: ES.user,
	password    : ES.password,
	ssl			: true

});

EM.dispatchResetPasswordLink = function(account, callback)
{
	EM.server.send({
		from         : ES.sender,
		to           : account.email,
		subject      : 'Password Reset',
		text         : 'something went wrong... :(',
		attachment   : EM.composeEmail(account)
	}, callback);
};

EM.composeEmail = function(o)
{
	var link = 'http://gatoraze.com:443/reset-password?e='+o.email+'&p='+o.pass;
	var html = "<html><body>";
	html += "Hi "+o.name+",<br><br>";
	html += "Your username is :: <b>"+o.user+"</b><br><br>";
	html += "<a href='"+link+"'>Please click here to reset your password</a><br><br>";
	html += "Cheers,<br>";
	html += "<a href='http://gatoraze.com:443/'>Home</a><br><br>";
	html += "</body></html>";
	return  [{data:html, alternative:true}];
};

EM.sendHi = function (details, callback)
{
	var html = "<html><body>";
	html += "Hi  from "+details.sender+", <br>";
	html += "<p>"+details.message+"</p><br>";
	html += "</body></html>";
	EM.server.send({
		from         : ES.sender,
		to           : "socceranoo@gmail.com",
		subject      : 'Hi from '+details.sender,
		text         : details.message,
		attachment   :[{data:html, alternative:true}]
	}, callback);
};
