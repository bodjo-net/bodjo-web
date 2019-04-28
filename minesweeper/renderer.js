
var lastField = null;

var gameContainer = document.querySelector("#game");
var fieldContainer = document.querySelector("#field");

function onResize(noNeedRender) {
	if (lastField != null) {

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

		
		if (typeof noNeedRender !== 'boolean' ||
			!noNeedRender)
			render(lastField);
	}
}
window.addEventListener('resize', onResize);

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

var height, width;
var W, H, s;
function render(field, _canvas) {
	lastField = field;
	if (height != field.length || width != field[0].length)
		onResize(true);

	if (_canvas)
		ctx = _canvas.getContext('2d');

	ctx.clearRect(0, 0, W, H);
	for (let y = 0; y < height; ++y)
		for (let x = 0; x < width; ++x)
			renderElement(x, y, field[y][x], s * window.devicePixelRatio, ctx);
}

var tiles = new Image();
tiles.src = 'tiles.png';
function renderElement(x, y, c, s, ctx) {
	var map = " Fx012345678*";
	var X = map.indexOf(c) % 4;
	var Y = ~~((map.indexOf(c) - X) / 4);
	// empty, flag, mine, opened
	// 1, 2, 3, 4
	// 5, 6, 7, 8
	ctx.drawImage(tiles, X*(tiles.width/4), Y*(tiles.height/4), 128, 128, x*s, y*s, s, s);
}