/*
 * Environment - a self-contained game environment.
 */

(function(window) {
	var EnvironmentMgr = {};
	
	//A key -> list of ordered declarations and env calls.
	//Each key is an environment name, that has a list of things
	//to be processed in order.
	EnvironmentMgr._declared = {};
	EnvironmentMgr._envCalls = {};

	//Key-value pairs for single properties.
	EnvironmentMgr._devices = {};
	EnvironmentMgr._assets = {};
	EnvironmentMgr._games = {};

	EnvironmentMgr.describe = function(name, descr) {
		EnvironmentMgr._devices[name] = descr.device;
		EnvironmentMgr._assets[name] = descr.assets;
		EnvironmentMgr._games[name] = descr.game;
	};

	EnvironmentMgr.declare = function(name, values) {
		var list = EnvironmentMgr._declared[name];
		if (!list) list = EnvironmentMgr._declared[name] = [];
		list.push(values);
	};

	EnvironmentMgr.env = function(name, callback) {
		var calls = EnvironmentMgr._envCalls[name];
		if (!calls) calls = EnvironmentMgr._envCalls[name] = [];
		calls.push(callback);
	};

	EnvironmentMgr.start = function(name) {
		var env = new Environment({
			name: name,
			device: EnvironmentMgr._devices[name],
			assets: EnvironmentMgr._assets[name],
			game: EnvironmentMgr._games[name]
		});

		env.start();
	};
	/**
	 * Construct new environment. The descriptor expects a device, game
	 * assets, and an actual game definition.
	 * @constructor
	 * @param {object} descr - descriptor containing all necessities.
	 */
	function Environment(descr) {
		if (!descr.name) throw new Error('No name declared for environment');
		if (!descr.device) throw new Error('No device present');
		if (!descr.assets) throw new Error('No game assets provided');
		if (!(descr.device instanceof Device))
			throw new Error('Expected a Device');

		this.name = descr.name;
		this.device = descr.device;
		this.assets = descr.assets;
		
		this.clock = {
			time: null,
			delta: null
		};

		//any declarations?
		this.env = {};
		if (EnvironmentMgr._declared[descr.name]) {
			var valueList = EnvironmentMgr._declared[descr.name];
			var self = this;
			
			valueList.forEach(function(values) {
				for (var key in values) {
					self.env[key] = values[key];
				}
			});

			delete EnvironmentMgr._declared[descr.name];
		}

		//any env calls?
		if (EnvironmentMgr._envCalls[descr.name]) {
			var callList = EnvironmentMgr._envCalls[descr.name];
			var self = this;
			
			callList.forEach(function(call) {
				var exports = call(self.env);
				if (exports) {
					for (var key in exports) {
						self.env[key] = exports[key];
					}
				}
			});

			delete EnvironmentMgr._envCalls[descr.name];
		}

		//check for game definition.
		var game = descr.game;
		if (!game) throw new Error('No game definition found');
		this.game = new game;
		delete EnvironmentMgr._devices[descr.name];
		delete EnvironmentMgr._assets[descr.name];
		delete EnvironmentMgr._games[descr.game];
	}

	/**
	 * Initialize the environment and start the game.
	 */
	Environment.prototype.start = function() {
		this.init();
		this._boundFrame = this.frame.bind(this);
		this.device.requestAnimationFrame(this._boundFrame);
	};

	/**
	 * Initialize the environment.
	 */
	Environment.prototype.init = function() {
		var devInit = this.device.init.bind(this.device);
		var success = devInit();

		//API check.
		if (this.game.supportedGraphics.indexOf(this.device.graphicsAPI) == -1) {
			throw new Error('Device uses ' + this.device.graphicsAPI + ', but game ' +
								 'does not support it.');
		}

		if (!success) {
			throw new Error('Device did not initialize successfully');
		}

		this.game.init(this.device, this.assets);
	};

	/**
	 * Process a single frame. That is, calculate delta time and delegate
	 * to the game handler.
	 * @param {number} time - the current time at the moment of this frame.
	 */
	Environment.prototype.frame = function(time) {
		//Update clocks
		//First time init
		if (this.clock.time == null) this.clock.time = time;
		
		// Track frameTime and its delta
		var delta = this.clock.delta = time - this.clock.time;
		this.clock.time = time;

		if (delta > 200) {
			console.log('Big dt = ', delta, ': Clamping to nominal');
			delta = this.device.refreshRate;
		}
		
		var du = delta / this.device.refreshRate;

		//do things
		this.game.update(this.device, du);
		this.game.render(this.device);

		this.device.requestAnimationFrame(this._boundFrame);
	};

	window.Environment = EnvironmentMgr;

})(window);
