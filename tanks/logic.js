var timeout = 16;
var isPlaying = false;
var playBtn = document.querySelector('#play');
var pauseBtn = document.querySelector('#pause');

playBtn.addEventListener('click', function () {
	if (!isPlaying) {
		playBtn.className = 'btn ripple down';
		isPlaying = true;
		if (socket.readyState == 1) {
			socket.send(JSON.stringify({type: 'start'}));
		}
	}
});
pauseBtn.addEventListener('click', function () {
	if (isPlaying) {
		playBtn.className = 'btn ripple';
		isPlaying = false;
		if (socket.readyState == 1) {
			socket.send(JSON.stringify({type: 'stop'}));
		}
	}
});

var width = null, height, tankRadius;

function startSocket() { 
	var url = "wss://vkram.shpp.me:"+PORT;
	var username = USERNAME;
	var token = GAME_SESSION_TOKEN;

	var socket = new WebSocket(url);
	var lastID = null;
	socket.onmessage = function (event) {
		try {
			var data = JSON.parse(event.data);
		} catch (e) {return;}

		if (data.type == 'connect') {
			if (data.status != 'ok') {
				if (data.errCode == 2) {
					alert('You have already connected to the game. Probably, you left a tab with the game.');
				}
				console.log(data);
			}
		} else if (data.type == 'const') {
			width = data.width;
			height = data.height;
			tankRadius = data.tankRadius;
			onResize();
		} else if (data.type == 'game') {

			render(data);

			if (isPlaying) {
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
				try {
					var response = onTick(data);
				} catch (e) {
					isPlaying = false;
					playBtn.className = 'btn ripple';
					showError(e.stack);
					return false;
				}

				if (!(typeof response === 'object' &&
					Array.isArray(response.move) &&
					response.move.length == 2 &&
					response.move[0] >= -1 && response.move[0] <= 1 &&
					response.move[1] >= -1 && response.move[1] <= 1 &&
					typeof response.head === 'number' &&
					Number.isFinite(response.head) &&
					typeof response.shoot === 'boolean')) {
					isPlaying = false;
					playBtn.className = 'btn ripple';
					var string = JSON.stringify(response,null,'\t');
					if (string.length > 300)
						showError('Function \'onTick\' returns bad response.');
					else showError('Function \'onTick\' returns bad response: \n\n'+string);
					return false;
				}

				clearErrors();
				socket.send(JSON.stringify(Object.assign({type:'game'}, response)));
			}
		} else if (data.type == 'score') {
			updateScoreboard(data.scoreboard, function (obj) {
				return [(obj.place+1)+'.', obj.username, obj.kills, obj.deaths, obj.kd.toFixed(4)];
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

	var llastID = lastID;
	setTimeout(function () {
		if (llastID != lastID || !isPlaying)
			return;
		lastID = (lastID||-1)+1;
	}, timeout);
	return true;
}

