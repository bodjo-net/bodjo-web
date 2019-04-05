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

    var players;
    if (data.players) {
        players = data.players;
    } else {
        var players = data.enemies.slice(0);
        players.push(data.me);
    }
    
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
    if (data.walls) {
        ctx.strokeStyle = '#9d9783';
        ctx.lineWidth = tankRadius * 0.7 / width * W;
        ctx.lineCap = 'round';
        for (var i = 0; i < data.walls.length; ++i) {
            var wall = data.walls[i];
            ctx.beginPath();
            ctx.moveTo(wall[0].x/width*W, wall[0].y/height*H);
            ctx.lineTo(wall[1].x/width*W, wall[1].y/height*H);
            ctx.stroke();
        }
    }

    for (var i = 0; i < players.length; ++i) {
        var player = players[i];

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
}