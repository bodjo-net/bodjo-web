var gameContainer = document.querySelector("#game");
var fieldContainer = document.querySelector("#field");

var height, width;
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
        red:  './assets/Bullets/bulletRed.png',
        blue: './assets/Bullets/bulletBlue.png',
        black:'./assets/Bullets/bulletSilver.png',
        green:'./assets/Bullets/bulletGreen.png',
        beige:'./assets/Bullets/bulletBeige.png'
    }),
    bulletSilver: loadSprites({
        red:  './assets/Bullets/bulletRedSilver.png',
        blue: './assets/Bullets/bulletBlueSilver.png',
        black:'./assets/Bullets/bulletSilverSilver.png',
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
        './assets/Smoke/smokeYellow0.png',
        './assets/Smoke/smokeYellow1.png',
        './assets/Smoke/smokeYellow2.png',
        './assets/Smoke/smokeYellow3.png',
        './assets/Smoke/smokeYellow4.png',
        './assets/Smoke/smokeYellow5.png'
    ]),
    bonuses: loadSprites({
        heal: './assets/Bonuses/aid.png',
        strength: './assets/Bonuses/ammo.png'
    })
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
var bonusesColors = {
    heal: 'rgba(0,185,0,0.25)',
    strength: 'rgba(150,70,0,0.25)'
}

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

var W, H, s;
var lastData = null;
var bulletEvents = [];
function render(data) {
    lastData = data;

    ctx.fillStyle = ctx.createPattern(sprites.bg.sand, 'repeat');
    ctx.fillRect(0,0,W,H);

    ctx.strokeStyle = '#9d9783';
    ctx.lineWidth = tankRadius * 0.7 / width * W;
    ctx.lineCap = 'round';
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
        ctx.rotate(player.angle%(PI*2)-PI/2);
        ctx.drawImage(sprites.tank[player.color], 
            -tankRadius/width*W*1.5*sqrt(2)/2, 
            -tankRadius/height*H*1.5*sqrt(2)/2, 
            tankRadius/width*W*1.5*sqrt(2), 
            tankRadius/height*H*1.5*sqrt(2));
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        var shootAnimation = range(data.time - player.lastShot, 0, 10) / 10;
        var r = sin(shootAnimation*PI) * tankRadius*2 / width * W;
        ctx.drawImage(sprites.whiteSmoke[~~(shootAnimation*5)],
            (player.x + cos(player.headAngle)*tankRadius)/width*W-r/2, 
            (player.y + sin(player.headAngle)*tankRadius)/height*H-r/2, r, r);

        var barrelSprite = sprites.barrel[player.color];
        ctx.translate(player.x/width*W, player.y/height*H);
        ctx.rotate(player.headAngle%(PI*2)-PI/2);
        ctx.drawImage(barrelSprite,
            -(barrelSprite.width / barrelSprite.height) * (tankRadius*1.5/height*H) / 2, 
            -tankRadius*(sin(shootAnimation*PI)/2+0.25)/height*H, 
            (barrelSprite.width / barrelSprite.height) * (tankRadius*1.5/height*H), 
            tankRadius*1.5/height*H
            );
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        var bonuses = Object.keys(player.activeBonuses);
        for (var i = 0; i < bonuses.length; ++i) {
            var bonus = player.activeBonuses[bonuses[i]];
            var t = range(data.time - bonus.start, 0, bonus.duration) / bonus.duration;
            var r = (-pow(t-0.5,10)*1000+1);
            ctx.fillStyle = bonusesColors[bonuses[i]];
            ctx.beginPath();
            ctx.arc(player.x/width*W, player.y/height*H, r*tankRadius*2/width*W, 0, PI*2);
            ctx.fill();
        }
    }

    for (var i = 0; i < data.bonuses.length; ++i) {
        var bonus = data.bonuses[i];
        var t = range(data.time-bonus.spawnTime, 0, 10) / 10;
        var r = (-pow((t-1)*0.5,4)*16+1);
        ctx.fillStyle = bonus.type == 'heal' ? 'rgba(0,185,0,0.5)' : 'rgba(150,70,0,0.5)';
        ctx.beginPath();
        ctx.arc(bonus.x/width*W, bonus.y/height*H, r*bonus.radius/width*W, 0, PI*2);
        ctx.fill();
        var sprite = sprites.bonuses[bonus.type];
        if (sprite) {
            var w = r*bonus.radius/width*W;
            ctx.drawImage(sprite, bonus.x/width*W-w/2, bonus.y/height*H-w/2, w, w);
        }
    }

    for (var i = 0; i < data.bullets.length; ++i) {
        var bullet = data.bullets[i];
        var bulletSprite = sprites[bullet.type?'bulletSilver':'bullet'][bullet.color];
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

    if (data.bulletEvents) {
        for (var i = 0; i < data.bulletEvents.length; ++i) {
            var event = data.bulletEvents[i];
            event.time = data.time;
            bulletEvents.push(event);
        }
    }
    for (var i = 0; i < bulletEvents.length; ++i) {
        var event = bulletEvents[i];
        var t = range(data.time - event.time, 0, 8) / 8;
        var r = (-pow(t-0.5,4)*16+1) * tankRadius*1.75 / width * W;
        var sprite = sprites.yellowSmoke[round(t*5)];
        var w = r * (100 / sprite.width), a = sprite.width / sprite.height,
            h = w / a;
        if (event.to == 'wall') {
            ctx.drawImage(sprite,
                event.x/width*W-w/2, 
                event.y/height*H-h/2, w, h);
        } else if (event.to == 'player') {
            var player = players.find(function (p) {
                return p.username == event.username;
            });
            ctx.drawImage(sprite,
                player.x/width*W-w/2, 
                player.y/height*H-h/2, w, h);
        }
        if (t == 1) {
            bulletEvents.splice(i, 1);
            i--;
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
function point(x, y, color) {
    ctx.beginPath();
    ctx.fillStyle = color || 'red';
    ctx.arc(x/width*W, y/height*H, 3, 0, PI*2);
    ctx.fill()
}
function line(a, b, color) {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color || 'red';
    ctx.moveTo(a.x/width*W, a.y/height*H);
    ctx.lineTo(b.x/width*W, b.y/height*H);
    ctx.stroke();
}