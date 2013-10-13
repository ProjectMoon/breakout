/**
 * A Device thinly abstracts the graphics and input handling of
 * whatever we are running on. Most commonly, abstracts the browser
 * canvas element and its associated graphics APIs.
 */
function Device() {
	this.keys = {};
	this._frames = {};
	this._namesToKeys = {};
}

//Keyboard handling.
//types of key events.
//Hold: detectable via isKeyHeld, intended for movement etc.
//cannot be listened to for events.
//Emit: Emit events continuously when pressed.
//Emit Once: Fire only once when pressed, until you let go and press again.
Device.KEY_TYPE_HOLD = 0;
Device.KEY_TYPE_EMIT = 1;
Device.KEY_TYPE_EMIT_ONCE = 2;

//basic properties to be overridden.
Device.prototype.name = 'unknown';

Device.prototype.defineKey = function(keyCharacter, keyType, keyName) {
	var keyCode = keyCharacter.charCodeAt(0);
	this.keys[keyCode] = {
		type: keyType,
		name: keyName,
		pressed: false
	};

	//initialize or update reverse mapping.
	if (!this._namesToKeys[keyName]) this._namesToKeys[keyName] = [];
	this._namesToKeys[keyName].push(keyCode);
};

Device.prototype.defineKeys = function(keys) {
	for (var key in keys) {
		var def = keys[key];
		this.defineKey(key, def[0], def[1]);
	}
};

Device.prototype.isKeyHeld = function(keyName) {
	var keyCodes = this._namesToKeys[keyName];

	if (keyCodes) {
		for (var c = 0; c < keyCodes.length; c++) {
			var keyCode = keyCodes[c];
			var key = this.keys[keyCode];
			if (key.type === Device.KEY_TYPE_HOLD) {
				if (key.pressed) {
					return true;
				}	
			}
			else {
				throw new Error(keyName + ' is not KEY_TYPE_HOLD');
			}
		}
	}
	else {
		console.log('No keys bound for name ' + keyName);
	}

	return false;
};

/**
 * Press a key. The device should call this method when it responds to
 * keypress events to properly trigger input events and keypress state
 * changes.
 */
Device.prototype.pressKey = function(keyCode) {
	if (this.keys[keyCode]) {
		var keybind = this.keys[keyCode];
		//EMIT_ONCE keys emit the event when the key is initially
		//pressed, but no more. regular EMIT will continually emit the
		//event every time a press is detected.
		if (keybind.type === Device.KEY_TYPE_EMIT_ONCE) {
			if (!this.keys[keyCode].pressed) {
				this.emitEvent('key' + keyCode, keyCode);
			}
		}

		if (keybind.type === Device.KEY_TYPE_EMIT) {
			this.emitEvent('key' + keyCode, keyCode);
		}
		
		this.keys[keyCode].pressed = true;
	}
	else {
		console.log('No binding for "' + String.fromCharCode(keyCode) + '"');
	}
};

/**
 * Unpress a key. The device should call this method when it detects a
 * key is no longer pressed to properly trigger input events and
 * keypress state changes.
 */
Device.prototype.unpressKey = function(keyCode) {
	if (this.keys[keyCode]) {
		this.keys[keyCode].pressed = false;
	}
	else {
		console.log('No binding for "' + String.fromCharCode(keyCode) + '"');
	}
};

/**
 * Listen for events for a given key binding name. Will trigger for
 * each key the name is bound to. Note that the event will trigger
 * based on each key bind's type, so if one name is bound to EMIT and
 * EMIT_ONCE, it will trigger once for the EMIT_ONCE key and
 * continuously for the EMIT key(s). The event receives the key code
 * (not character) as an argument.
 */
Device.prototype.addInputListener = function(keyName, callback) {
	var keyCodes = this._namesToKeys[keyName];

	var self = this;
	keyCodes.forEach(function(keyCode) {
		self.addEventListener('key' + keyCode, callback);
	});
};

//Event handling
Device.prototype.addEventHandler = function(eventName, callback) {
	throw new Error('No device addEventHandler function implemented.');
};

Device.prototype.emitEvent = function(eventName, evt) {
	throw new Error('No device emitEvent function implemented.');
};

/**
 * Responsible for initializing the device's keyboard and graphics
 * handling capabilities.
 */
Device.prototype.init = function() {
	throw new Error('No device init function implemented.');
};

//basic graphics handling -- to be implemented by derived objects.

/**
 * The type of graphics API this device is using. Games can say which
 * ones they support and Environment will reject if it it's wrong.
 */
Device.prototype.graphicsApi = 'unknown';
Device.prototype.refreshRate = null;

Device.prototype.clear = function() {
	throw new Error('No device clear function implemented.');
};

Device.prototype.height = function() {
	throw new Error('No device height function implemented.');
};

Device.prototype.width = function() {
	throw new Error('No device width function implemented.');
};

Device.prototype.requestAnimationFrame = function() {
	throw new Error('No device requestAnimationFrame function implemented');
};

/**
 * A basic device implementation for the browser.
 */
function BrowserDevice(id, refreshRate) {
	//set a custom property, device name, and refresh rate.
	this.id = id;
	this.name = id;
	this.refreshRate = refreshRate;
}

//extend from Device.
BrowserDevice.prototype = new Device;

BrowserDevice.prototype.init = function() {
	//since we should be using this in a browser, we assume a document
	//and window object exist.

	//set normal device properties.
	this.graphicsAPI = 'canvas2d';

	//set our own properties.
	this.canvas = document.getElementById(this.id);
	this.ctx = this.canvas.getContext('2d');
	this.requestAnimationFrame = window.requestAnimationFrame.bind(window);
	
	//input device setup.
	var self = this;
	window.addEventListener('keydown', function(event) {
		self.pressKey(event.keyCode);
	});
	
	window.addEventListener('keyup', function(event) {
		self.unpressKey(event.keyCode);
	});

	return true;
};

BrowserDevice.prototype.clear = function() {
	this.ctx.clearRect(0, 0, this.width(), this.height());
};

BrowserDevice.prototype.height = function() {
	return this.canvas.height;
};

BrowserDevice.prototype.width = function() {
	return this.canvas.width;
};

BrowserDevice.prototype.addEventListener = function(eventName, callback) {
	this.canvas.addEventListener(eventName, function(event) {
		var detail = event.detail;
		callback(detail);
	}, false);
};

BrowserDevice.prototype.emitEvent = function(eventName, evt) {
	var event = new CustomEvent(eventName, { detail: evt });
	this.canvas.dispatchEvent(event);
};
