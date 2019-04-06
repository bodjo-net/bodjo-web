var timeout = 16;
var isPlaying = false;
var playBtn = document.querySelector('#play');
var pauseBtn = document.querySelector('#pause');
var socket;
var code = null, func = false;

playBtn.addEventListener('click', function () {
	if (!isPlaying) {
		playBtn.className = 'btn ripple down';
		isPlaying = true;
		if (socket.readyState == 1) {
			code = editor.getValue();
			socket.send(JSON.stringify({type: 'start'}));
		}
	}
});
pauseBtn.addEventListener('click', function () {
	if (isPlaying) {
		stop();
	}
});

var width = null, height, tankRadius;
var difference = -1;
function startSocket() { 
	var url = "wss://vkram.shpp.me:"+PORT;
	var username = USERNAME;
	var token = GAME_SESSION_TOKEN;

	socket = new WebSocket(url);
	socket.onmessage = function (event) {
		var data;
		try {
			data = JSON.parse(event.data);
		} catch (e) {return;}

		if (data.type == 'connect') {
			if (data.status != 'ok') {
				if (data.errCode == 2) {
					alert('You have already connected to the game. Probably, you left a tab with the game.');
				}
				console.log(data);
			} else {
				socket.send(JSON.stringify({
					type: 'saveALL',
					username, 
					value: JSON.parse(localStorage.all||'[]')
				}))
			}
		} else if (data.type == 'const') {
			width = data.width;
			height = data.height;
			tankRadius = data.tankRadius;
			if (data.timestamp)
				difference = Date.now() - data.timestamp;
			onResize();
		} else if (data.type == 'game') {
			if (difference != -1 && abs((Date.now() - difference) - data.timestamp) > 200)
				return;
			
			render(data);
			if (isPlaying && !data.me)
				return;

			if (isPlaying) {
				if (!func) {
					code = editor.getValue();
					try {
						eval(code);
					} catch (e) {
						console.log();
						stop();
						showError(e.stack);
						return false;
					}

					if (typeof onTick !== 'function') {
						stop();
						showError('Function \"onTick\" is not found.');
						return false;
					}
					func = onTick;
				}

				if (typeof func !== 'function') {
					stop();
					showError('Function \"onTick\" is not found.');
					return false;
				}
				try {
					var response = func(data);
				} catch (e) {
					stop();
					showError(e.stack);
					return false;
				}

				if (!(typeof response === 'object' &&
					Array.isArray(response.move) &&
					response.move.length == 2 &&
					response.move[0] >= -1 && response.move[0] <= 1 &&
					response.move[1] >= -1 && response.move[1] <= 1 &&
					typeof response.headAngle === 'number' &&
					Number.isFinite(response.headAngle) &&
					typeof response.shoot === 'boolean')) {
					isPlaying = false;
					stop()
					var string = typeof response === 'undefined' ? 'undefined' : JSON.stringify(response,null,'\t');
					if (string.length > 300)
						showError('Function \"onTick\" returned bad response.');
					else showError('Function \"onTick\" returned bad response: \n\n'+string);
					return false;
				}

				clearErrors();
				socket.send(JSON.stringify(Object.assign({type:'game'}, response)));
			}
		} else if (data.type == 'score') {
			updateScoreboard(data.scoreboard, function (obj) {
				return [(obj.place+1)+'.', obj.username, obj.points];
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

function stop() {
	playBtn.className = 'btn ripple';
	isPlaying = false;
	if (socket && socket.readyState == 1) {
		code = null;
		func = null;
		socket.send(JSON.stringify({type: 'stop'}));
	}
}