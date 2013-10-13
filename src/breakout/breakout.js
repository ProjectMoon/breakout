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
var totalScore;
var levelScore;

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
	levelScore = 0;
	totalScore = 0;
	

	var self = this;
	device.addEventListener(HIT_BOTTOM, function() {
		//game over
		console.log('game over');
		self.gameOver = true;
		clearInterval(newBlockTimer);
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

			totalScore += evt.brick.points;
			levelScore += evt.brick.points;
		}
	});

	//serves 2 purposes: launch the ball at the start, and use powers.
	device.addInputListener(LAUNCH, function(keyCode) {
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
			var newBricks = bricks.newRow();
			assoc.sendMessage('panel', 'upcomingBricks', newBricks);
		}
	});

	//new bricks when the panel tells us it's time
	//then we immediately generate a new row for previewing
	//(to be added to the top in 8 sec)
	assoc.setMessageListener('newBricks', function(newBricks) {
		bricks.addBricksToTop(newBricks);
		var newBricks = bricks.newRow();
		assoc.sendMessage('panel', 'upcomingBricks', newBricks);
	});

	//select powers
	device.addInputListener(POWER_LEFT, function(keyCode) {
		powerselector.move(-1);
	});

	device.addInputListener(POWER_RIGHT, function(keyCode) {
		powerselector.move(1);
	});
};

Breakout.prototype.update = function(device, du) {
	if (this.gameOver) return;

	//Reduce power slightly. gotta keep hitting bricks!
	if (powerbar.power > 0) powerbar.add(-.02 * du);
	if (powerbar.power < 0) powerbar.power = 0;

	//new level every 100 points
	if (levelScore >= 100) {
		ball.speed += .5;
		paddle.vel += .7;
		levelScore = 0;
	}

	//update game objects.
	paddle.update(device, du);
	ball.update(device, du);
};

Breakout.prototype.render = function(device) {
	device.clear();

	//draw bottom line separating power bar and selector from the game
	//field.
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

