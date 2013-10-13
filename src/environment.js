/*
 * Environment - a self-contained game environment.
 */

(function(window) {
	/**
	 * Construct new environment. The descriptor expects a device, game
	 * assets, and an actual game definition.
	 * @constructor
	 * @param {object} descr - descriptor containing all necessities.
	 */
	function Environment(descr) {
		if (!descr.name) throw new Error('No name declared for environment');
		if (!descr.assets) throw new Error('No game assets provided');
		if (!descr.associations) throw new Error('No associations provided');
		if (!descr.device && !('devices' in descr)) {
			throw new Error('No device(s) present');
		}

		//only check device instance if we are not providing multiple devices.
		if (!('devices' in descr)) {
			if (!(descr.device instanceof Device))
				throw new Error('Expected a Device');
		}

		this.name = descr.name;
		if (descr.device)	this.devices = [ descr.device ];
		else this.devices = descr.devices;
		this.assets = descr.assets;

		//create associations. each assoc is an isolated game
		//environment of sorts.
		var self = this;
		this.assoc = {};
		var deviceNames = Object.keys(descr.associations);

		deviceNames.forEach(function(deviceName) {
			var device = null;

			for (var c = 0; c < self.devices.length; c++) {
				if (self.devices[c].name === deviceName) {
					device = self.devices[c];
					break;
				}
			}

			if (device == null) {
				throw new Error('Invalid device name ' + deviceName);
			}

			var game = descr.associations[deviceName];
			if (!game) throw new Error('No game definition found');

			//object that holds the game, device, and clock for this
			//particular device.
			var assoc = {
				device: device,
				game: new game,
				clock: {
					time: null,
					delta: null
				}
			};

			self.assoc[deviceName] = assoc;
		});
	}

	/**
	 * Initialize the environment and start the game.
	 */
	Environment.prototype.start = function() {
		this.init();
		for (deviceName in this.assoc) {
			var assoc = this.assoc[deviceName];

			//the "this" context of the frame function will always
			//be the assoc.
			assoc._boundFrame = this.frame.bind(assoc);
			assoc.device.requestAnimationFrame(assoc._boundFrame);
		}
	};

	/**
	 * Initialize the environment.
	 */
	Environment.prototype.init = function() {
		var self = this;
		this.devices.forEach(function(device) {
			var devInit = device.init.bind(device);
			var success = devInit();
			
			if (!success) {
				throw new Error('Device did not initialize successfully');
			}

			//API check.
			var assoc = self.assoc[device.name];
			var game = assoc.game;
			if (game.supportedGraphics.indexOf(device.graphicsAPI) == -1) {
				throw new Error('Device uses ' + device.graphicsAPI +
									 ', but game does not support it.');
			}

			//Init game.
			game.init(assoc);
		});
	};

	/**
	 * Process a single frame. That is, calculate delta time and
	 * delegate to the game handler. The "this" context in this
	 * function is not actually the Environment. Rather, it is the
	 * association (containing clock, device, game instance).
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

	window.Environment = Environment;

})(window);
