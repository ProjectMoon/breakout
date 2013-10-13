/*
TODO:
 - deathray
 - once ball reaches a certain speed, cap it out
 - debuff blocks: smaller paddle, mirror controls, dubstep?
 - darken blocks that are < max life.
 - implement proper respawn
 - spinning black hole type background image (blue of course)
 - random black holes that pull the ball towards it?
 - replicate the debug stuff in the pong framework:
    * C = stop clearing
    * P = pause
    * O = single step if paused.
    * F = weird debug frame thingy
    * Q = quit (gameover)
    * T = show timers (current time, delta, previous time)
    * R = toggle rendering
    * B = draw a red box

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

function Breakout() {
	console.log('Breakout loaded.');
	this.gameOver = false;
}

Breakout.prototype = new Game;

//What graphics do we support?
Breakout.prototype.supportedGraphics = [ 'canvas2d' ];

//keynames

//methods
Breakout.prototype.init = function(assoc) {
	var device = assoc.device;
	device.defineKeys(BINDS);

	paddle = new Paddle();
	bricks = new Bricks();
	bricks.makeLevel();
	ball = new Ball(paddle, bricks, device);
	powerbar = new Powerbar(0, 10);
	powerselector = new PowerSelector();
	globals.levelScore = 0;
	globals.totalScore = 0;
	
	var self = this;

	device.addEventListener(HIT_BOTTOM, function() {
		//game over
		console.log('game over');
		self.gameOver = true;
		//later switch for respawning.
		assoc.sendMessage('panel', 'gameOver', true);
	});

	device.addEventListener(HIT_BRICK, function(evt) {
		evt.brick.life -= ball.power;
		if (!ball.ubermode) {
			powerbar.add(1);
			powerbar.lock(.1);
		}
		
		if (evt.brick.life <= 0) {
			//remove brick from the grid.
			bricks.bricks[evt.r][evt.c] = null;

			if (!powerbar.isMaxPower()) {
				powerbar.add(2, 'kill');
				powerbar.lock(.5, 'kill');
			}

			globals.totalScore += evt.brick.points;
			globals.levelScore += evt.brick.points;
		}
	});

	//quit
	device.addInputListener(QUIT, function() {
		console.log('quit by button press');
		self.gameOver = true;
		assoc.sendMessage('panel', 'gameOver', true);
	});

	//serves 2 purposes: launch the ball at the start, and use powers.
	device.addInputListener(LAUNCH, function() {
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

			//start up the preview/brick adding system.
			var newBricks = bricks.newRows(globals.level);
			assoc.sendMessage('panel', 'upcomingBricks', newBricks);
		}
	});

	//new bricks when the panel tells us it's time
	//then we immediately generate a new row for previewing
	//(to be added to the top in 8 sec)
	assoc.setMessageListener('newBricks', function(newBricks) {
		if (!self.gameOver) {
			bricks.addBricksToTop(newBricks);
			var newBricks = bricks.newRows(globals.level);
			assoc.sendMessage('panel', 'upcomingBricks', newBricks);
		}
	});

	//select powers
	device.addInputListener(POWER_LEFT, function() {
		powerselector.move(-1);
	});

	device.addInputListener(POWER_RIGHT, function() {
		powerselector.move(1);
	});
};

Breakout.prototype.update = function(device, du) {
	if (this.gameOver) return;

	//Reduce power slightly. gotta keep hitting bricks!
	if (powerbar.power > 0) powerbar.add(-.02 * du);
	if (powerbar.power < 0) powerbar.power = 0;

	//new level every 100 points
	if (globals.levelScore >= 100) {
		ball.speed += .5;
		paddle.vel += .7;
		globals.levelScore = 0;
		globals.level++;

		//add rows of bricks = to level (normally it's level / 2)
		//only every few levels because otherwise ubermode goes crazy.
		if (globals.level % 5 == 0) {
			var bunchOfBricks = bricks.newRows(globals.level, true);
			bricks.addBricksToTop(bunchOfBricks);
		}
	}

	//update game objects.
	paddle.update(device, du);
	ball.update(device, du);
};

Breakout.prototype.render = function(device) {
	if (this.gameOver) return;
	device.clear();
	if (!device.isRenderingEnabled()) return;
	
	bricks.render(device);
	paddle.render(device);
	ball.render(device);

	var ctx = device.ctx;
	//render a white background so the blocks and whatnot don't render below.
	ctx.save();
	ctx.fillStyle = 'white';
	var x = 0, y = device.height() - BOTTOM_OFFSET;
	ctx.fillRect(x, y, device.width(), BOTTOM_OFFSET);
	ctx.restore();

	//draw bottom line separating power bar and selector from the game
	//field.

	ctx.save();

	ctx.beginPath();
	ctx.moveTo(0, device.height() - BOTTOM_OFFSET);
	ctx.lineTo(device.width(), device.height() - BOTTOM_OFFSET);
	ctx.lineWidth = 10;
	ctx.stroke();
	
	ctx.restore();
	
	powerbar.render(device);
	powerselector.render(device);
};

