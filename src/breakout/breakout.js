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
Breakout.prototype.init = function(env) {
	env.device.defineKeys(BINDS);

	paddle = new Paddle();
	bricks = new Bricks();
	ball = new Ball(paddle, bricks, env.device);
	powerbar = new Powerbar(10);
	powerselector = new PowerSelector();

	var self = this;
	env.device.addEventListener(HIT_BOTTOM, function() {
		//game over
		console.log('game over');
		self.gameOver = true;
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

		ball.speed += .1;
		paddle.vel += .15;
	});

	env.device.addInputListener(LAUNCH, function(keyCode) {
		if (!ball.launched) {
			ball.launch();
		}
	});

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

	if (powerbar.isMaxPower()){
		//ready to launch captain.
		//ubermode!
		/*
		ball.ubermode = true;
		powerbar.expire(function() {
			ball.ubermode = false;
		}, 3);
		*/
	}
	
	paddle.update(device, du);
	ball.update(device, du);
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

