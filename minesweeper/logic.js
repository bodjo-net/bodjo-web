var userToken = localStorage.token || getCookie('token');
var username = localStorage.username || getCookie('username');
if (!userToken || !username) {
	// bad
	alert('We lost your username or token. Try to come back to https://bodjo.net and connect to game again.');
	window.location.href = 'https://bodjo.net';
} else {
	request('GET', '/play', {gameName: gameName, token: userToken}, function (obj) {
		if (obj.status == 'ok') {
			PORT = obj.port;
			GAME_SESSION_TOKEN = obj.gameSessionToken;
			USERNAME = username;

			startSocket();
		} else {
			alert('Your token is invalid. Try to come back to https://bodjo.net and sign in again.');
			window.location.href = 'https://bodjo.net';
		}
	});
}
		// 	request('GET', '/play', {gameName: name, token: token}, function (_obj) {
		// 		if (_obj.status == 'ok') {
		// 			window.location.href = window.location.protocol + '//' + window.location.hostname + '/' + name + '/?token=' + encodeURIComponent(_obj.gameSessionToken) + '&username=' + encodeURIComponent(username) + '&port=' + encodeURIComponent(_obj.port);
		// 		} else {
		// 			console.log(_obj);
		// 		}
		// 	});
		// });

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
	var url = "wss://vkram.shpp.me:"+PORT;
	// var url = 'ws://localhost:3423'
	var username = USERNAME;
	var token = GAME_SESSION_TOKEN;
	// var token = '1';
	// var username = '1';

	socket = new WebSocket(url);
	lastID = null;
	socket.onmessage = function (event) {
		try {
			var data = JSON.parse(event.data);
		} catch (e) {return;}

		if (data.type == 'connect') {
			if (data.status != 'ok') {
				if (data.errCode == 2) {
					alert('You have been already connected to game. Probably, you left a tab with the game.');
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
				return [(obj.place+1)+'.', obj.username, levels[obj.level]];
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
		var string = JSON.stringify(response,null,'\t');
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


var field = null;

var gameContainer = document.querySelector("#game");
var fieldContainer = document.querySelector("#field");

function onResize() {
	if (field != null)
		render(field);
}
window.addEventListener('resize', onResize);

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

var height, width;
var W, H, s;
function render(field) {
	height = field.length;
	width = field[0].length;
	lastFieldSize = [width, height];
	let cWidth = gameContainer.clientWidth - 20;
	let cHeight = gameContainer.clientHeight - 20;

	let aspect = width / height;
	let cAspect = cWidth / cHeight;

	if (height * cAspect > aspect * width) {
		H = cHeight;
		W = cHeight * aspect;
		s = H / height;
		fieldContainer.style.marginLeft = (cWidth - W) / 2 + "px";
		fieldContainer.style.marginTop = "0px";
	} else {
		W = cWidth;
		H = cWidth / aspect;
		s = W / width;
		fieldContainer.style.marginTop = (cHeight - H) / 2 + "px";
		fieldContainer.style.marginLeft = "0px";
	}

	fieldContainer.style.width = W + "px";
	fieldContainer.style.height = H + "px";

	canvas.width = W * window.devicePixelRatio;
	canvas.height = H * window.devicePixelRatio;

	ctx.clearRect(0, 0, W, H);
	for (let y = 0; y < height; ++y)
		for (let x = 0; x < width; ++x)
			renderElement(x, y, field[y][x], s * window.devicePixelRatio);
}

var tiles = new Image();
tiles.src = 'tiles.png';
function renderElement(x, y, c, s) {
	var map = " Fx012345678*";
	var X = map.indexOf(c) % 4;
	var Y = ~~((map.indexOf(c) - X) / 4);
	// empty, flag, mine, opened
	// 1, 2, 3, 4
	// 5, 6, 7, 8
	ctx.drawImage(tiles, X*(tiles.width/4), Y*(tiles.height/4), 128, 128, x*s, y*s, s, s);
}