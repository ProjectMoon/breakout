var paddle;
var ball;
var bricks;
var powerbar;
var powerselector;

function Breakout() {
	console.log('Breakout loaded.');
	this.gameOver = false;
	this.deathrays = [];
	this.gotClearBonus = false;
}

Breakout.prototype = new Game;

//What graphics do we support?
Breakout.prototype.supportedGraphics = [ 'canvas2d' ];

//keynames

//methods
Breakout.prototype.respawn = function(device) {
	paddle = new Paddle();
	bricks = new Bricks();
	bricks.makeLevel();
	ball = new Ball(paddle, bricks, device);
	powerbar = new Powerbar(0, 10);
	powerselector = new PowerSelector();

	this.deathrays = [];
	this.gotClearBonus = false;
	
	globals.levelScore = 0;
	globals.totalScore = 0;
	globals.level = 1;
};

Breakout.prototype.init = function(assoc) {
	var device = assoc.device;
	device.defineKeys(BINDS);

	this.respawn(device);
	
	var self = this;

	device.addEventListener(HIT_BOTTOM, function() {
		//game over
		console.log('game over');
		document.getElementById('gameover').play();
		//self.gameOver = true;
		//later switch for respawning.
		globals.games++;
		globals.previousScores.push({
			score: globals.totalScore,
			level: globals.level
		});
		self.respawn(device);
		assoc.sendMessage('panel', 'respawn');
	});

	device.addEventListener(HIT_BRICK, function(evt) {
		evt.brick.life -= ball.power;
		if (!ball.ubermode) {
			powerbar.add(1 + (globals.level / 100));
			powerbar.lock(.1);
		}
		
		if (evt.brick.life <= 0) {
			//remove brick from the grid.
			bricks.bricks[evt.r][evt.c] = null;

			if (!powerbar.isMaxPower()) {
				powerbar.add(2 + (globals.level / 100), 'kill');
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
					document.getElementById('ubermode').play();
				}

				if (power === 'slowtime') {
					ball.slowtime = true;
					document.getElementById('slowtime').play();
				}

				if (power === 'deathray') {
					self.deathray(paddle, bricks, device);
					document.getElementById('deathray').play();
				}
				
				powerbar.expire(function() {
					ball.ubermode = false;
					ball.slowtime = false;
					self.deathrays = [];
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

Breakout.prototype.deathray = function(paddle, bricks, device) {
	//deathray: create a bunch of ubermode balls moving in random directions
	//that go off the screen.

	for (var c = 0; c < 8; c++) {
		var ball = new Ball(paddle, bricks, device);
		ball.ubermode = true;
		ball.deathray = true;
		ball.speed = 20;
		this.deathrays.push(ball);
		var xVel = util.getRandomInt(-4, 4);
		ball.launch(xVel);
	}
};

Breakout.prototype.update = function(device, du) {
	if (this.gameOver) return;

	//Reduce power slightly. gotta keep hitting bricks!
	if (powerbar.power > 0) powerbar.add(-.02 * du);
	if (powerbar.power < 0) powerbar.power = 0;

	//Get a bonus if you clear the screen
	if (bricks.isClear()) {
		if (!this.gotClearBonus) {
			globals.totalScore += 10000 * globals.level;
			this.gotClearBonus = true;
		}
	}
	else {
		this.gotClearBonus = false;
	}

	//new level every 100 level points
	if (globals.levelScore >= 50) {
		ball.speed += .3;
		paddle.vel += .5;
		globals.totalScore += 1000 *globals.level;
		globals.levelScore = 0;
		globals.level++;

		//add rows of bricks = to level (normally it's level / 2) only
		//every few levels because otherwise ubermode goes crazy.  also
		//stop at higher levels because it gets challenging in other
		//ways.
		if (globals.level % 3 == 0 && globals.level < 10) {
			//var bunchOfBricks = bricks.newRows(globals.level, true);
			//bricks.addBricksToTop(bunchOfBricks);
		}
	}

	//update game objects.
	paddle.update(device, du);
	ball.update(device, du);

	this.deathrays.forEach(function(deathBall) {
		deathBall.update(device, du);
	});
};

Breakout.prototype.render = function(device) {
	if (this.gameOver) return;
	device.clear();
	if (!device.isRenderingEnabled()) return;
	
	bricks.render(device);
	paddle.render(device);
	ball.render(device);

	this.deathrays.forEach(function(deathBall) {
		deathBall.render(device);
	});

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

	//render some instructions at the bottom right.
	var x = device.width() - 300;
	var y = device.height() - 40;

	ctx.save();

	ctx.fillText('A/D = move left/right', x, y);
	y += 10;
	ctx.fillText('J/K = select power', x, y);
	y += 10;
	ctx.fillText('Space = launch/use power', x, y);
	
	ctx.restore();
};

