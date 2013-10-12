Environment.declare('breakout', {
		MOVE_LEFT: 'MOVE_LEFT',
		MOVE_RIGHT: 'MOVE_RIGHT'
});

Environment.env('breakout', function(env) {
	env.MOVE_LEFT = 'MOVE_LEFT';
	var paddle = new env.Paddle();
	
	function Breakout() {
		console.log('Breakout loaded.');
	}

	Breakout.prototype = new Game;

	//What graphics do we support?
	Breakout.prototype.supportedGraphics = [ 'canvas2d' ];

	//keynames

	//methods
	Breakout.prototype.init = function(device, assets) {
		device.defineKey('A', Device.KEY_TYPE_HOLD, env.MOVE_LEFT);
		device.defineKey('D', Device.KEY_TYPE_HOLD, env.MOVE_RIGHT);
	};

	Breakout.prototype.update = function(device, du) {
		paddle.update(device, du);
	};

	Breakout.prototype.render = function(device) {
		device.clear();
		paddle.render(device);
	};

	return { BreakoutGame: Breakout };
});
