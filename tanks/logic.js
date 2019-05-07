const local = false;

var dataToRender = null;
var lastDataRendered = 0;

var littleEndian = (function() {
  var buffer = new ArrayBuffer(2);
  new DataView(buffer).setInt16(0, 256, true);
  return new Int16Array(buffer)[0] === 256;
})();

var id = -1;

var TPS;
var timeout = 16;
var isPlaying = false;
var playBtn = document.querySelector('#play');
var pauseBtn = document.querySelector('#pause');
var socket;
var code = null, func = false;
var lastScores = null;

var usernames = {};

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
	if (isPlaying)
		stop();
});

const colors = [
	'red', 'blue', 'black', 'green', 'beige'
];

const max8 = 255;
const max16 = 65535;
const symbolsRange = ' 1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM_-';
function processData(data) {

	var offset = 0;
	var type = new Uint8Array(data.slice(offset, offset+=1))[0];
	if (type == 0) {
		var O = {};
		O.time = new Uint32Array(data.slice(offset, offset+=4))[0];

		var playersCount = new Uint8Array(data.slice(offset, offset+=1))[0];
		O.players = new Array(playersCount);
		O.enemies = new Array();
		for (var i = 0; i < playersCount; ++i) {
			var pO = {};
			var d1 = new Uint8Array(data.slice(offset, offset+=2));
			var d2 = new Uint16Array(data.slice(offset, offset+=8));
			var d3 = new Uint8Array(data.slice(offset, offset+=3));
			pO.id = d1[0];
			pO.username = usernames[pO.id] || '...';
			pO.color = colors[d1[1]];
			pO.x = d2[0] / max16 * width;
			pO.y = d2[1] / max16 * height;
			pO.vx = (d2[2] / max16 * 2 - 1) / TPS * 2.5;
			pO.vy = (d2[3] / max16 * 2 - 1) / TPS * 2.5;
			pO.angle = atan2(pO.vy, pO.vx);
			pO.hp = d3[0] / max8;
			pO.lastShot = d3[1];
			pO.bonuses = {};
			pO.bonuses.heal = d3[2] == 1 || d3[2] == 3;
			pO.bonuses.ammo = d3[2] == 2 || d3[2] == 3;
			pO.headAngle = new Float32Array(data.slice(offset, offset+=4))[0];
			O.players[i] = pO;
			if (pO.id == id) {
				O.me = pO;
			} else
				O.enemies.push(pO);
		}

		var bulletsCount = new Uint8Array(data.slice(offset, offset+=1))[0];
		O.bullets = new Array(bulletsCount);
		for (var i = 0; i < bulletsCount; ++i) {
			var bO = {};
			var d = new Uint8Array(data.slice(offset, offset+=7));
			bO.owner = usernames[d[0]] || '...';
			bO.x = d[1] / max8 * width;
			bO.y = d[2] / max8 * height;
			bO.vx = (d[3] / max8 * 2 - 1) / TPS * 10;
			bO.vy = (d[4] / max8 * 2 - 1) / TPS * 10;
			bO.angle = atan2(bO.vy, bO.vx);
			bO.color = colors[d[5]];
			bO.type = d[6] == 1;
			O.bullets[i] = bO;
		}

		var bulletEventsCount = new Uint8Array(data.slice(offset, offset+=1))[0];
		O.bulletEvents = new Array(bulletEventsCount);
		for (var i = 0; i < bulletEventsCount; ++i) {
			var buO = {};
			var type = new Uint8Array(data.slice(offset, offset+=1))[0];
			if (type == 0) {
				buO.to = 'player';
				buO.username = usernames[new Uint8Array(data.slice(offset, offset+=1))[0]] || '...';
			} else if (type == 1) {
				buO.to = 'wall';
				var d = new Uint16Array(data.slice(offset, offset+=4));
				buO.x = d[0] / max16 * width;
				buO.y = d[1] / max16 * height;
			}
			O.bulletEvents[i] = buO;
		}

		var bonusesCount = new Uint8Array(data.slice(offset, offset+=1))[0];
		O.bonuses = new Array(bonusesCount);
		for (var i = 0; i < bonusesCount; ++i) {
			var bnO = {};
			var d = new Uint8Array(data.slice(offset, offset+=3));
			bnO.type = (['ammo','heal'])[d[0]];
			bnO.x = d[1] / max8 * width;
			bnO.y = d[2] / max8 * height;
			bnO.radius = bonusRadius;
			O.bonuses[i] = bnO;
		}

		O.walls = walls;

		lastData = O;
		lastDataBuffer = data;
		O.messageType = 'game';
		return O;
	} else {
		var count = new Uint8Array(data.slice(offset, offset+=1))[0];
		var O = new Array(count);

		for (var i = 0; i < count; ++i) {
			var p = {};
			var d = new Uint8Array(data.slice(offset, offset+=3));
			p.id = d[0];
			p.place = d[1];
			var uCount = d[2], uname = "...";
			if (uCount != 0) {
				var darr = new Uint8Array(data.slice(offset, offset+=uCount));
				uname = Array.from(darr, function (x) {
					return symbolsRange[x];
				}).join('');
				if (uname == username)
					id = p.id;
				usernames[p.id] = uname;
			} else if (usernames[p.id])
				uname = usernames[p.id]
			p.username = uname;
			p.points = new Uint32Array(data.slice(offset, offset+=4))[0];
			O[i] = p;
		}
		return {messageType: 'score', scoreboard: O};
	}
}

var url, username, token;
var width = null, height, tankRadius, bonusRadius, walls;
var difference = -1;
function startSocket() { 
	if (!local) {
		url = "wss://vkram.shpp.me:"+PORT;
		username = USERNAME;
		token = GAME_SESSION_TOKEN;
	} else {
		url = 'ws://localhost:3424';
		username = token = prompt();
	}

	socket = new WebSocket(url);
	socket.binaryType = 'arraybuffer';
	socket.onmessage = function (event) {
		if (event.data instanceof ArrayBuffer) {
			var data = processData(event.data);
			if (data.messageType == 'score') {
				// for (var i = 0; i < data.scoreboard.length; ++i) {
				// 	if (typeof data.scoreboard[i].id === 'number')
				// 		usernames[data.scoreboard[i].id] = data.scoreboard[i].username;
				// }
				updateScoreboard(lastScores = data.scoreboard, function (obj) {
					return [(obj.place+1)+'.', obj.username, obj.points];
				});
			} else if (data.messageType == 'game') {
				dataToRender = data;
				lastDataRendered = Date.now()
				// render(data);
					console.log(data)
				if (isPlaying && data.me) {
					if (!func) {
						code = editor.getValue();
						try {
							eval(code);
						} catch (e) {
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
					var buffer = new ArrayBuffer(13);
					var bufferView = new DataView(buffer);
					bufferView.setFloat32(0, response.headAngle % (Math.PI*2));
					bufferView.setFloat32(4, response.move[0]);
					bufferView.setFloat32(8, response.move[1]);
					bufferView.setInt8(12, !!response.shoot-0);
					socket.send(bufferView);
				}
			}
			return;
		}

		var data;
		try {
			data = JSON.parse(event.data);
		} catch (e) {return;}

		if (data.type == 'connect') {
			if (data.status != 'ok') {
				if (data.errCode == 2) {
					alert('You have already connected to the game. Probably, you left a tab with the game.');
				}
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
			bonusRadius = data.bonusRadius;
			walls = data.walls;
			TPS = data.TPS;
			onResize();
			requestAnimationFrame(sendReady);
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

function sendReady() {
	// socket.send('r');
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