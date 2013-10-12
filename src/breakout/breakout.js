var paddle;
var ball;
var bricks;
var power = 0; //if we enter supermode?

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

	var self = this;
	env.device.addEventListener(HIT_BOTTOM, function() {
		//game over
		console.log('game over');
		self.gameOver = true;
	});

	env.device.addEventListener(HIT_BRICK, function(evt) {
		evt.brick.life -= ball.power;
		if (!ball.ubermode) {
			power++;
		}
		
		if (evt.brick.life <= 0) {
			bricks.bricks[evt.r][evt.c] = null;

			if (!ball.ubermode) {
				power += evt.brick.points;
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
	if (power > 0) power -= .02 * du;
	if (power < 0) power = 0;

	if (power >= 10) {
		//ubermode!
		ball.ubermode = true;
		power = 0;
		setTimeout(function() {
			ball.ubermode = false;
		}, 3 * 1000);
	}
	document.getElementById('info').innerText = power;
	paddle.update(device, du);
	ball.update(device, du);
};

Breakout.prototype.render = function(device) {
	device.clear();
	bricks.render(device);
	paddle.render(device);
	ball.render(device);
};

