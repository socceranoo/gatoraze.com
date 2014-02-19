$(document).ready(function(){
	var lv = new LoginValidator();
	var lc = new LoginController();
	// main login form //
	$('#login-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			if (lv.validateForm() === false){
				return false;
			} else{
				// append 'remember-me' option to formData to write local cookie //
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') {
				if (responseText.url === '')
					window.location.href = '/home';
				else
					window.location.href = responseText.url;
			}
		},
		error : function(e){
			lv.showLoginError('Login Failure', 'Please check your username and/or password');
		}
	}); 

	$('#user-tf').focus();

	// login retrieval form via email //

	var ev = new EmailValidator();

	$('#get-credentials-form').ajaxForm({
		url: '/lost-password',
		beforeSubmit : function(formData, jqForm, options){
			if (ev.validateEmail($('#email-tf').val())){
				ev.hideEmailAlert();
				return true;
			}	else{
				ev.showEmailAlert("<b> Error!</b> Please enter a valid email address");
				return false;
			}
		},
		success	: function(responseText, status, xhr, $form){
			ev.showEmailSuccess("Check your email on how to reset your password.");
		},
		error : function(){
			ev.showEmailAlert("Sorry. There was a problem, please try again later.");
		}
	});

});
