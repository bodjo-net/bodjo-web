var socket, lastID;
var timeout = 16;
var isPlaying = false;
var playBtn = document.querySelector('#play');
var pauseBtn = document.querySelector('#pause');
var againBtn = document.querySelector('#again');
var difficultySelect = document.querySelector('#difficulty select');
var timeoutRange = document.querySelector('#timeout input[type=range]');
var timeoutText = document.querySelector('#timeout p');

playBtn.addEventListener('click', function () {
	if (!isPlaying) {
		playBtn.className = 'btn ripple down';
		isPlaying = true;

		if (socket.readyState == 1)
			tick();
	}
});
pauseBtn.addEventListener('click', function () {
	if (isPlaying) {
		playBtn.className = 'btn ripple';
		isPlaying = false;
	}
});
againBtn.addEventListener('click', function () {
	if (socket.readyState == 1) {
		lastID++;
		socket.send(JSON.stringify({
			type: 'repeat',
			id: lastID
		}));
	}
});
difficultySelect.addEventListener('change', function () {
	if (socket.readyState == 1) {
		lastID++;
		socket.send(JSON.stringify({
			type: 'level',
			level: difficultySelect.selectedIndex,
			id: lastID
		}));
	}
});
timeoutRange.addEventListener('mousemove', function () {
	timeout = parseInt(timeoutRange.value);
	timeoutText.innerText = timeout + 'ms';
	localStorage.timeout = timeout;
});
if (localStorage.timeout && !isNaN(parseInt(localStorage.timeout))) {
	timeout = parseInt(localStorage.timeout);
}
timeoutRange.value = timeout;
timeoutText.innerText = timeout + 'ms';

function startSocket() {
	// var url = 'ws://localhost:3423'
	// var token = '1';
	// var username = '1';
	var url = "wss://vkram.shpp.me:"+PORT;
	var username = USERNAME;
	var token = GAME_SESSION_TOKEN;

	socket = new WebSocket(url);
	lastID = null;
	socket.onmessage = function (event) {
		try {
			var data = JSON.parse(event.data);
		} catch (e) {return;}

		if (data.type == 'connect') {
			if (data.status != 'ok') {
				if (data.errCode == 2) {
					alert('You have already connected to the game. Probably, you left a tab with the game.');
				}
			}
		} else if (data.type == 'game' && (lastID == data.id || lastID == null)) {

			difficultySelect.selectedIndex = (data.level);
			field = data.field;
			render(field);
		
			if (isPlaying) {	
				if (data.status == 'playing') {
					tick();
				} else if (data.status == 'win' || data.status == 'defeat') {
					setTimeout(function () {
						lastID++;
						socket.send(JSON.stringify({
							type: 'repeat',
							id: lastID
						}));
					}, timeout*2);
				}
			}
		} else if (data.type == 'score') {
			updateScoreboard(data.scoreboard, function (obj) {
				var levels = ['—', 'Beginner', 'Intermediate', 'Expert', 'Expert+'];
				return [(obj.place+1)+'.', obj.username, levels[obj.level+1]];
			});
		}
	}
	socket.onopen = function () {
		socket.send(JSON.stringify({
			type: 'connect',
			username,
			token,
			role: 'player'
		}));
	}
}

function tick() {
	if (!isPlaying && field != null) 
		return;

	var code = editor.getValue();
	try {
		eval(code);
	} catch (e) {
		isPlaying = false;
		playBtn.className = 'btn ripple';
		showError(e.stack);
		return false;
	}

	if (typeof onTick !== 'function') {
		isPlaying = false;
		playBtn.className = 'btn ripple';
		showError('Function \'onTick\' is missing.');
		return false;
	}

	var response = onTick(field);
	if (typeof response !== 'object' ||
		typeof response.action !== 'string' ||
		['open','mark'].indexOf(response.action) < 0 ||
		!Array.isArray(response.coordinates) ||
		response.coordinates.length != 2 ||
		response.coordinates[0] < 0 || response.coordinates[0] >= field[0].length ||
		response.coordinates[1] < 0 || response.coordinates[1] >= field.length) {
		isPlaying = false;
		playBtn.className = 'btn ripple';
		var string = typeof response == 'undefined' ? 'undefined' : JSON.stringify(response,null,'\t');
		if (string.length > 300)
			showError('Function \'onTick\' returns bad response.');
		else showError('Function \'onTick\' returns bad response: \n\n'+string);
		return false;
	}

	clearErrors();
	var llastID = lastID;
	setTimeout(function () {
		if (llastID != lastID || !isPlaying)
			return;
		lastID = (lastID||-1)+1;
		socket.send(JSON.stringify({
			type: 'game',
			data: response,
			id: lastID||0
		}));
	}, timeout);
	return true;
}

