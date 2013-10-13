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
			var assoc = new Assoc(self, {
				device: device,
				game: new game,
				clock: {
					time: null,
					delta: null
				}
			});

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
			assoc.start();
		}
	};

	/**
	 * Initialize the environment.
	 */
	Environment.prototype.init = function() {
		for (var deviceName in this.assoc) {
			var assoc = this.assoc[deviceName];
			assoc.init();
		}
	};

	Environment.prototype.sendMessage = function(assocName, msgName, msg) {
		var assoc = this.assoc[assocName];

		if (assoc) {
			assoc.receiveMessage(msgName, msg);
		}
		else {
			throw new Error('assoc "' + assocName + '" does not exist.');
		}
	};

	/**
	 * Create an Assoc: collection of device, game instance, and clock.
	 */
	function Assoc(env, descr) {
		this._environment = env;
		this._messageListeners = {};
		
		for (var key in descr) {
			this[key] = descr[key];
		}
	}

	Assoc.prototype.init = function() {
		var device = this.device;
		var devInit = device.init.bind(device);
		var success = devInit();
		
		if (!success) {
			throw new Error('Device did not initialize successfully');
		}
		
		//API check.
		var game = this.game;
		if (game.supportedGraphics.indexOf(device.graphicsAPI) == -1) {
			throw new Error('Device uses ' + device.graphicsAPI +
								 ', but game does not support it.');
		}
		
		//Init game.
		game.init(this);

		this._inited = true;
	};

	Assoc.prototype.start = function() {
		if (!this._inited) throw new Error('Assoc not initialized.');

		//the "this" context of the frame function will always
		//be the assoc.
		this._boundFrame = this.frame.bind(this);
		this.device.requestAnimationFrame(this._boundFrame);
	};

	/**
	 * Send a message to another assoc. The assoc must bind to the
	 * receive message method for the proper method name in order to
	 * get the message.
	 */
	Assoc.prototype.sendMessage = function(assocName, messageName, message) {
		this._environment.sendMessage(assocName, messageName, message);
	};

	Assoc.prototype.setMessageListener = function(messageName, callback) {
		this._messageListeners[messageName] = callback;
	};

	Assoc.prototype.receiveMessage = function(messageName, message) {
		var listener = this._messageListeners[messageName];

		if (listener) {
			//direct call can cause weird ajax bugs.
			//TODO abstract for non web use?
			setTimeout(function() {
				listener(message);
			}, 0);
		}
	};
	
	/**
	 * Process a single frame. That is, calculate delta time and
	 * delegate to the game handler.
	 * @param {number} time - the current time at the moment of this frame.
	 */
	Assoc.prototype.frame = function(time) {	
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
		
		//are we paused? if so, do not update unless a step was requested.
		//otherwise, just update normally.
		if (this.device.isPaused()) {
			if (this.device.step()) {
				this.game.update(this.device, du);
			}
		}
		else {
			this.game.update(this.device, du);
		}

		this.game.render(this.device);

		this.device.requestAnimationFrame(this._boundFrame);
	};

	Assoc.prototype.debugFrame = function(time) {
		
	};

	window.Environment = Environment;

})(window);
