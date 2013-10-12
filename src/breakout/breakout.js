var paddle;
var ball;

function Breakout() {
	console.log('Breakout loaded.');
}

Breakout.prototype = new Game;

//What graphics do we support?
Breakout.prototype.supportedGraphics = [ 'canvas2d' ];

//keynames

//methods
Breakout.prototype.init = function(env) {
	env.device.defineKeys(BINDS);

	paddle = new Paddle();
	ball = new Ball(paddle, env.device);

	env.device.addEventListener(HIT_BOTTOM, function() {
		//game over
		alert('game over');
		location.reload();
	});
};

Breakout.prototype.update = function(device, du) {
	paddle.update(device, du);
	ball.update(device, du);
};

Breakout.prototype.render = function(device) {
	device.clear();
	paddle.render(device);
	ball.render(device);
};

