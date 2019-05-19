var bulletDangerousRadius = tankRadius * 5;

function isBulletDangerous(bullet, me, walls) {
    // line(bullet, {
    //     x: bullet.x + bullet.vx*20,
    //     y: bullet.y + bullet.vy*20
    // }, 'rgba(255,0,0,0.25)')
    return lineCircle(bullet, {
        x: bullet.x + bullet.vx*20,
        y: bullet.y + bullet.vy*20
    }, me, bulletDangerousRadius) && can(me, bullet, walls, true);
}

function can(me, B, walls, isBullet) {
    var A = me;
    var angle = atan2(A.y - B.y, A.x - B.x);
    if (!isBullet) {
        var A1 = {x: me.x + cos(angle-PI/2)*tankRadius,
                  y: me.y + sin(angle-PI/2)*tankRadius}
        var A2 = {x: me.x + cos(angle+PI/2)*tankRadius,
                  y: me.y + sin(angle+PI/2)*tankRadius}
    }
    for (var i = 0; i < walls.length; ++i) {
        var wall = walls[i];
        if (lineLine(wall[0], wall[1], A, B) ||
            (isBullet ? false : lineLine(wall[0], wall[1], A1, B) ||
            lineLine(wall[0], wall[1], A2, B)))
            return false;
    }
    line(me, B, 'rgba(0,255,0,0.5)');
    return true;
}

var enemySearchRadius = distance({x:0,y:0},{x:width/2,y:height/2});
function getNearestEnemy(enemies, me, walls) {
    if (enemies.length == 0)
        return null;
        
    var res = null, d = -1;
    for (var i = 0; i < enemies.length; ++i) {
        var dist = distance(enemies[i], me);
        var canShootValue = can(me, enemies[i], walls, false);
        if (canShootValue && (dist < d || d == -1)) {
            d = dist;
            res = enemies[i];
        }
    }
    return res;
}
function getNearestBonus(bonuses, me, walls) {
    if (bonuses.length == 0)
        return null;
        
    var res = null, d = -1;
    for (var i = 0; i < bonuses.length; ++i) {
        if (me.username == 'pacifist' && bonuses[i].type == 'ammo')
            continue;
        var dist = distance(bonuses[i], me);
        if (can(me, bonuses[i], walls, false) && 
            (dist < d || d == -1)) {
            d = dist;
            res = bonuses[i];
        }
    }
    return res;
}
function getDangerousBullet(bullets, me, walls) {
    bullets = bullets.filter(b => b.owner != me.username);

    var res = null, minDist = -1;
    for (var i = 0; i < bullets.length; ++i) {
        var bullet = bullets[i];
        var dist = distance(bullet, me);
        if (isBulletDangerous(bullet, me, walls) && (dist < minDist || minDist == -1)) {
            minDist = dist;
            res = bullet;
        }
    }
    return res;
}
function getSide(a, b, c) {
    return ((b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x)) > 0;
}

function onTick(field) {
    
    var me = field.me;
    for (var player of field.players) {
        line(player, {
            x: player.x - player.vx,
            y: player.y - player.vy
        });
        circle({
            x: player.x - player.vx,
            y: player.y - player.vy
        }, 0.025)
    }
        
    circle(me, bulletDangerousRadius, 'rgba(255,0,0,0.25)');
    circle(me, tankRadius*10, 'rgba(0,0,0,0.25)');
    
    var dangerousBullet = getDangerousBullet(field.bullets, me, field.walls);
    var bonus = getNearestBonus(field.bonuses, me, field.walls);
    var enemy = getNearestEnemy(field.enemies, me, field.walls);
    
    var move;
    var shoot = false;
    if (dangerousBullet != null) {
        var side = getSide(dangerousBullet, {
            x: dangerousBullet.x+dangerousBullet.vx, 
            y: dangerousBullet.y+dangerousBullet.vy},
        me);
        var r = 0.75;
        var side1 = can(me, {
            x: me.x + cos(dangerousBullet.angle+PI/2)*r,
            y: me.y + sin(dangerousBullet.angle+PI/2)*r
        }, field.walls, false);
        var side2 = can(me, {
            x: me.x + cos(dangerousBullet.angle-PI/2)*r,
            y: me.y + sin(dangerousBullet.angle-PI/2)*r
        }, field.walls, false);
        var back = can(me, {
            x: me.x + cos(dangerousBullet.angle)*r,
            y: me.y + sin(dangerousBullet.angle)*r
        }, field.walls, false);
        if ((!((side && side1) || (!side && side2)))) {
            side = !side;
        }
        if ((!side1 && !back) || (!back && !side2) || (!side1 && !side2) || !back)
            shoot = true;
        var angle = dangerousBullet.angle+(side?1:-1)*PI/2;
        move = [
            cos(angle),
            sin(angle)
        ];
    } else if (enemy && (me.username == 'pacifist' ? distance(me, enemy) < tankRadius*20 : true)) {
        var angle = atan2(enemy.y - me.y, enemy.x - me.x);
        var dist = distance(me, enemy);
        var canGoBack = can(me, {x: me.x+cos(angle-PI), y: me.y+sin(angle-PI)}, field.walls, false);
        if ((dist < tankRadius * 10 || me.username == 'pacifist') && canGoBack) {
            angle -= PI;
        }
        move = [
            cos(angle), sin(angle)  
        ];
    } else if (bonus) {
        var angle = atan2(bonus.y - me.y, bonus.x - me.x);
        move = [
            cos(angle), sin(angle)  
        ];
    } else {
        move = [
            cos(Date.now()/1000*PI),
            sin(Date.now()/3000*PI)
        ];
    }

    return {
        move,
        headAngle: enemy ? toEnemy(me, enemy) : Date.now()/1000*PI,
        shoot: shoot || !!enemy
    }  
}

function toEnemy(me, enemy) {
    return atan2(enemy.y+enemy.vy*4 - me.y, enemy.x+enemy.vx*4 - me.x);
}

function distance(a, b) {
    return sqrt(pow(a.x-b.x,2)+pow(a.y-b.y,2));
}
function lineLine(a, b, c, d) {
    var s1_x = b.x - a.x
    var s1_y = b.y - a.y
    var s2_x = d.x - c.x
    var s2_y = d.y - c.y
    var s = (-s1_y * (a.x - c.x) + s1_x * (a.y - c.y)) / (-s2_x * s1_y + s1_x * s2_y)
    var t = (s2_x * (a.y - c.y) - s2_y * (a.x - c.x)) / (-s2_x * s1_y + s1_x * s2_y)
    return s >= 0 && s <= 1 && t >= 0 && t <= 1
}
function lineCircle(a, b, c, rc) {
    var ac = {x: c.x - a.x, y: c.y - a.y}
    var ab = {x: b.x - a.x, y: b.y - a.y}
    var ab2 = dot(ab, ab)
    var acab = dot(ac, ab)
    var t = acab / ab2
    t = (t < 0) ? 0 : t
    t = (t > 1) ? 1 : t
    var h = {x: (ab.x * t + a.x) - c.x, y: (ab.y * t + a.y) - c.y}
    var h2 = dot(h, h)
    return h2 <= rc * rc
}
function dot(a, b) {
    return (a.x * b.x) + (a.y * b.y)
}