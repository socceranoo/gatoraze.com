$(document).ready(function() {
	var socket = io.connect();
	var session = 1;
	function addMessage(msg, pseudo) {
		$("#chatEntries").append('<div class="message"><p>' + pseudo + ' : ' + msg + '</p></div>');
	}
	function sentMessage() {
		if ($('#messageInput').val() !== "") {
			socket.emit('message', $('#messageInput').val());
			addMessage($('#messageInput').val(), "Me", new Date().toISOString(), true);
			$('#messageInput').val('');
		} else {
			socket.emit('event1', {});
		}
	}
	socket.on('connect', function() {
		// Connected, let's sign-up for to receive messages for this room
		socket.emit('setPseudo', {user:user, site:site, room:site+session , session:session});
		$('#chatControls').show();
	});
	socket.on('message', function(data) {
		addMessage(data.message, data.pseudo);
	});
	$("#submit").click(function() {
		sentMessage();
	});
});
