var paddle = new Paddle();

function Breakout() {
	console.log('Breakout loaded.');
}

Breakout.prototype = new Game;

//What graphics do we support?
Breakout.prototype.supportedGraphics = [ 'canvas2d' ];

//keynames

//methods
Breakout.prototype.init = function(device, assets) {
	device.defineKeys(BINDS);
};

Breakout.prototype.update = function(device, du) {
	paddle.update(device, du);
};

Breakout.prototype.render = function(device) {
	device.clear();
	paddle.render(device);
};

