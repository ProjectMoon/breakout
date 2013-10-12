var paddle;
var ball;
var bricks;
var powerbar;
var powerbarLock = false;

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
	powerbar = new Powerbar(0);

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
		paddle.speed += .3;
	});

	env.device.addInputListener(LAUNCH, function(keyCode) {
		if (!ball.launched) {
			ball.launch();
		}
	});
};

Breakout.prototype.update = function(device, du) {
	if (this.gameOver) return;
	if (powerbar.power > 0) powerbar.add(-.02 * du);
	if (powerbar.power < 0) powerbar.power = 0;

	if (powerbar.powerup()){
		//ubermode!
		ball.ubermode = true;
		powerbar.expire(function() {
			ball.ubermode = false;
		}, 3);
	}
	
	paddle.update(device, du);
	ball.update(device, du);
};

Breakout.prototype.render = function(device) {
	device.clear();
	bricks.render(device);
	powerbar.render(device);
	paddle.render(device);
	ball.render(device);
};

