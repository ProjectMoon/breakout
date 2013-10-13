/*
TODO:
 - deathray
 - remove/rework 2d array for bricks to allow them
   to move and add new brick rows dynamically.
 - slowly start bringing in new brick rows of randomized bricks
 - gameover (or massive score loss) if blocks go past you
 - once ball reaches a certain speed, cap it out
 - implement faster and faster balls as "levels"
 - make levels tied to points
 - debuff blocks: smaller paddle, mirror controls, dubstep?
 - keep track of and display score.
 - darken blocks that are < max life.
 - implement proper respawn
 - spinning black hole type background image (blue of course)
 - random black holes that pull the ball towards it?

 cool things (need 6):
 - powerup meter
 - tetris type speedup with constant incoming blocks
 - black hole
 - debuff blocks
 - dubstep mode?
 */

var paddle;
var ball;
var bricks;
var powerbar;
var powerselector;
var newBlockTimer;

function Breakout() {
	console.log('Breakout loaded.');
	this.gameOver = false;
}

Breakout.prototype = new Game;

//What graphics do we support?
Breakout.prototype.supportedGraphics = [ 'canvas2d' ];

//keynames

//methods
Breakout.prototype.init = function(env) {
	env.device.defineKeys(BINDS);

	paddle = new Paddle();
	bricks = new Bricks();
	ball = new Ball(paddle, bricks, env.device);
	powerbar = new Powerbar(0, 10);
	powerselector = new PowerSelector();

	var self = this;
	env.device.addEventListener(HIT_BOTTOM, function() {
		//game over
		console.log('game over');
		self.gameOver = true;
		clearInterval(newBlockTimer);
	});

	env.device.addEventListener(HIT_BRICK, function(evt) {
		evt.brick.life -= ball.power;
		if (!ball.ubermode) {
			powerbar.add(1);
			powerbar.lock(.1);
		}
		
		if (evt.brick.life <= 0) {
			bricks.bricks[evt.r][evt.c] = null;

			if (!powerbar.isMaxPower()) {
				powerbar.add(2, 'kill');
				powerbar.lock(.5, 'kill');
			}
		}

		//ubermode makes the speed go up way too fast
		//otherwise.
		if (!ball.ubermode) {
			ball.speed += .1;
			paddle.vel += .15;
		}
		else {
			ball.speed += .02;
			paddle.vel += .025;
		}
	});

	//serves 2 purposes: launch the ball at the start, and use powers.
	env.device.addInputListener(LAUNCH, function(keyCode) {
		if (ball.launched) {
			if (powerbar.isMaxPower()) {
				var power = powerselector.getSelected();

				powerbar.powerup();
				if (power === 'ubermode') {
					ball.ubermode = true;
				}

				if (power === 'slowtime') {
					ball.slowtime = true;
				}
				
				powerbar.expire(function() {
					ball.ubermode = false;
					ball.slowtime = false;
				}, 3);
			}
		}
		else {
			ball.launch();

			//every 10 seconds, generate a new row of bricks.
			//here so it doesn't start until we launch.
			newBlockTimer = setInterval(function() {
				bricks.newRow();
			}, 10 * 1000);
		}
	});

	//select powers
	env.device.addInputListener(POWER_LEFT, function(keyCode) {
		powerselector.move(-1);
	});

	env.device.addInputListener(POWER_RIGHT, function(keyCode) {
		powerselector.move(1);
	});
};

Breakout.prototype.update = function(device, du) {
	if (this.gameOver) return;
	if (powerbar.power > 0) powerbar.add(-.02 * du);
	if (powerbar.power < 0) powerbar.power = 0;
	
	paddle.update(device, du);

	if (!ball.slowtime) {
		ball.update(device, du);
	}
	else {
		ball.update(device, du / 8);
	}
};

Breakout.prototype.render = function(device) {
	device.clear();

	//draw bottom line
	var ctx = device.ctx;
	ctx.save();

	ctx.beginPath();
	ctx.moveTo(0, device.height() - BOTTOM_OFFSET);
	ctx.lineTo(device.width(), device.height() - BOTTOM_OFFSET);
	ctx.lineWidth = 10;
	ctx.stroke();
	ctx.restore();
	
	bricks.render(device);
	powerbar.render(device);
	powerselector.render(device);
	paddle.render(device);
	ball.render(device);
};

