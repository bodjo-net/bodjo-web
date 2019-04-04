var url = "ws://localhost:3423";
var username = "1";
var token = "1";

var timeout = 16;
var isPlaying = false;
var playBtn = document.querySelector('#play');
var pauseBtn = document.querySelector('#pause');

playBtn.addEventListener('click', function () {
	if (!isPlaying) {
		playBtn.className = 'btn ripple down';
		isPlaying = true;
		//if (socket.readyState == 1)
			//tick();
	}
});
pauseBtn.addEventListener('click', function () {
	if (isPlaying) {
		playBtn.className = 'btn ripple';
		isPlaying = false;
	}
});

var width = null, height, tankRadius;

var socket = new WebSocket(url);
var lastID = null;
socket.onmessage = function (event) {
	try {
		var data = JSON.parse(event.data);
	} catch (e) {return;}

	if (data.type == 'connect') {
		if (data.status != 'ok')
			console.log(data);
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


var field = null;

var gameContainer = document.querySelector("#game");
var fieldContainer = document.querySelector("#field");

function onResize() {
	if (width != null) {
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
		W *= window.devicePixelRatio;
		H *= window.devicePixelRatio;
		canvas.width = W;
		canvas.height = H;

		if (lastData != null)
			render(lastData);
	}
}
window.addEventListener('resize', onResize);

var sprites = {
	tank: loadSprites({
		red: './assets/Tanks/tankRed.png',
		blue: './assets/Tanks/tankBlue.png',
		black: './assets/Tanks/tankBlack.png',
		green: './assets/Tanks/tankGreen.png',
		beige: './assets/Tanks/tankBeige.png'
	}),
	barrel: loadSprites({
		red:  './assets/Tanks/barrelRed.png',
		blue: './assets/Tanks/barrelBlue.png',
		black:'./assets/Tanks/barrelBlack.png',
		green:'./assets/Tanks/barrelGreen.png',
		beige:'./assets/Tanks/barrelBeige.png'
	}),
	bullet: loadSprites({
		red:  './assets/Bullets/bulletRedSilver.png',
		blue: './assets/Bullets/bulletBlueSilver.png',
		black:'./assets/Bullets/bulletSilver.png',
		green:'./assets/Bullets/bulletGreenSilver.png',
		beige:'./assets/Bullets/bulletBeigeSilver.png'
	}),
	bg: loadSprites({
		dirt: './assets/Environment/dirt.png',
		grass: './assets/Environment/grass.png',
		sand: './assets/Environment/sand.png',
	}),
	whiteSmoke: loadSprites([
		'./assets/Smoke/smokeWhite0.png',
		'./assets/Smoke/smokeWhite1.png',
		'./assets/Smoke/smokeWhite2.png',
		'./assets/Smoke/smokeWhite3.png',
		'./assets/Smoke/smokeWhite4.png',
		'./assets/Smoke/smokeWhite5.png'
	]),
	yellowSmoke: loadSprites([
		'./assets/Smoke/smokeWhite0.png',
		'./assets/Smoke/smokeWhite1.png',
		'./assets/Smoke/smokeWhite2.png',
		'./assets/Smoke/smokeWhite3.png',
		'./assets/Smoke/smokeWhite4.png',
		'./assets/Smoke/smokeWhite5.png'
	])
};
function loadSprites(obj) {
	var res = {};
	for (var k = 0; k < Object.keys(obj).length; ++k) {
		var key = Object.keys(obj)[k];
		res[key] = new Image();
		res[key].src = obj[key];
	}
	return res;
}

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

var height, width;
var W, H, s;
var lastData = null;
function render(data) {
	lastData = data;

	ctx.fillStyle = ctx.createPattern(sprites.bg.sand, 'repeat');
	ctx.fillRect(0,0,W,H);

	ctx.strokeRect(0,0,W-1,H-1);

	var players = data.enemies.slice(0);
	players.push(data.me);
	for (var i = 0; i < players.length; ++i) {
		var player = players[i];
		ctx.translate((player.x)/width*W, 
					  (player.y)/height*H);
		ctx.rotate(player.direction-PI/2);
		ctx.drawImage(sprites.tank[player.color], 
			-tankRadius/width*W*1.5*sqrt(2)/2, 
			-tankRadius/height*H*1.5*sqrt(2)/2, 
			tankRadius/width*W*1.5*sqrt(2), 
			tankRadius/height*H*1.5*sqrt(2));
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		var shootAnimation = range(data.time - player.lastShot, 0, 7) / 7;
		var r = sin(shootAnimation*PI) * tankRadius*2 / width * W;
		ctx.drawImage(sprites.whiteSmoke[~~(shootAnimation*5)],
			(player.x + cos(player.headDirection)*tankRadius)/width*W-r/2, 
			(player.y + sin(player.headDirection)*tankRadius)/height*H-r/2, r, r);

		var barrelSprite = sprites.barrel[player.color];
		ctx.translate(player.x/width*W, player.y/height*H);
		ctx.rotate(player.headDirection-PI/2);
		ctx.drawImage(barrelSprite,
			-(barrelSprite.width / barrelSprite.height) * (tankRadius*1.5/height*H) / 2, 
			-tankRadius*(0.25+sin(shootAnimation*PI)/2)/height*H, 
			(barrelSprite.width / barrelSprite.height) * (tankRadius*1.5/height*H), 
			tankRadius*1.5/height*H
			);
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		ctx.strokeStyle = '#000000';
		ctx.lineWidth = window.devicePixelRatio * 1.5;
		ctx.fillStyle = '#ff0000';
		ctx.strokeRect((player.x-tankRadius)/width*W, (player.y-tankRadius*1.4)/height*H, tankRadius/width*W*2, tankRadius/height*H*0.25);
		ctx.fillRect((player.x-tankRadius)/width*W, (player.y-tankRadius*1.4)/height*H, (tankRadius/width*W*2)*player.hp, tankRadius/height*H*0.25);

		ctx.fillStyle = '#000000';
		ctx.strokeStyle = '#ffffff';
		ctx.font = tankRadius*0.75/height*H + 'px \'Source Code Pro\'';
		var text = ctx.measureText(player.username);
		ctx.fillText(player.username, (player.x)/width*W-text.width/2, (player.y-tankRadius*1.6)/height*H);
	}

	for (var i = 0; i < data.bullets.length; ++i) {
		var bullet = data.bullets[i];
		var bulletSprite = sprites.bullet[bullet.color];
		ctx.translate(bullet.x/width*W, bullet.y/height*H);
		ctx.rotate(bullet.angle-PI/2+PI);
		ctx.drawImage(bulletSprite,
			-(bulletSprite.width/bulletSprite.height)*(tankRadius/height*H)/2, 
			0, 
			(bulletSprite.width/bulletSprite.height)*(tankRadius/height*H), 
			tankRadius/height*H);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}
}