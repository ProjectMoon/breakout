/**
 * A Device thinly abstracts the graphics and input handling of
 * whatever we are running on. Most commonly, abstracts the browser
 * canvas element and its associated graphics APIs.
 */
function Device() {
	//key binds
	this.keys = {};

	//whether or not to respect calls to the clear command.

	//private variables to be accessible via method calls.
	this._render = true;
	this._pause = false;
	this._clear = true;
	
	
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
Device.KEY_TYPE_TOGGLE = 3;

//basic properties to be overridden.
Device.prototype.name = 'unknown';

Device.prototype.defineKey = function(keyCharacter, keyType, keyName) {
	var keyCode = keyCharacter.charCodeAt(0);
	this.keys[keyCode] = {
		type: keyType,
		name: keyName,
		pressed: false,
		toggled: false //only relevant for KEY_TYPE_TOGGLE
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
			if (!keybind.pressed) {
				var evt = {
					keyCode: keyCode
				};
				this.emitEvent('key' + keyCode, evt);
			}
		}

		if (keybind.type === Device.KEY_TYPE_EMIT) {
			var evt = {
				keyCode: keyCode
			};
			this.emitEvent('key' + keyCode, evt);
		}

		//toggle behaves as EMIT_ONCE, but also sets a toggle state
		//specific to the key (not key bind).
		if (keybind.type === Device.KEY_TYPE_TOGGLE) {
			if (!keybind.pressed) {
				keybind.toggled = !keybind.toggled;
				var evt = {
					keyCode: keyCode,
					toggle: keybind.toggled
				};

				this.emitEvent('key' + keyCode, evt);
			}
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
 * (not character) as an argument. Toggle keys receive a secondary argument,
 * indicating the state of the toggle.
 */
Device.prototype.addInputListener = function(keyName, callback) {
	var keyCodes = this._namesToKeys[keyName];

	var self = this;
	keyCodes.forEach(function(keyCode) {
		self.addEventListener('key' + keyCode, callback);
	});
};

//Event handling
/**
 * Add an event listener to the device. Both the name and what is
 * passed into hte callback function are up to the developer. The
 * handler receives a payload indepedent of what the underlying device
 * platform is. For example, in a browser, the CustomEvent detail is
 * sent directly instead of sending the whole CustomEvent.
 */
Device.prototype.addEventListener = function(eventName, callback) {
	throw new Error('No device addEventListener function implemented.');
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
Device.prototype.isDebugDevice = false;

/**
 * Clear the device, if clear is set to true. Otherwise, silently
 * ignore it.
 */
Device.prototype.clear = function() {
	if (this.clear) {
		throw new Error('No device clear function implemented.');
	}
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

//debug thingies.
Device.prototype.enableClearing = function() {
	this._clear = true;
};

Device.prototype.disableClearing = function() {
	this._clear = false;
};

Device.prototype.isClearingEnabled = function() {
	return this._clear;
};

//Enable and disable rendering. Note that it is up to the application
//to respond to this. The Environment cannot control rendering without
//also directly controlling clearing, which if it does, causes
//problems when using debug devices.
Device.prototype.enableRendering = function() {
	this._render = true;
};

Device.prototype.disableRendering = function() {
	this._render = false;
};

Device.prototype.isRenderingEnabled = function() {
	return this._render;
};

Device.prototype.pause = function() {
	this._pause = true;
};

Device.prototype.unpause = function() {
	this._pause = false;
};

Device.prototype.isPaused = function() {
	return this._pause;
};

/**
 * Instruct the Environment to step the device one frame. Only works
 * when the device is paused.
 */
Device.prototype.step = function() {
	var step = this._step;
	this._step = false;
	return step;
};

/**
 * Queue a step for pause mode. Once queued, can be accessed once via
 * step() method before getting stuck paused again.
 */
Device.prototype.queueStep = function() {
	this._step = true;
};

/**
 * A basic device implementation for the browser.
 */
function BrowserDevice(id, refreshRate) {
	//set a custom property, device name, and refresh rate.
	this.id = id;
	this.name = id;
	this.graphicsAPI = 'canvas2d';
	this.refreshRate = refreshRate;
	this.requestAnimationFrame = window.requestAnimationFrame.bind(window);
}

//extend from Device.
BrowserDevice.prototype = new Device;

BrowserDevice.prototype.init = function() {
	//since we should be using this in a browser, we assume a document
	//and window object exist.

	//set normal device properties.
	//normally rFA should be overriden via prototype,
	//but can't really do that here.


	//set our own properties.
	this.canvas = document.getElementById(this.id);
	this.ctx = this.canvas.getContext('2d');
	
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
	if (this._clear) {
		this.ctx.clearRect(0, 0, this.width(), this.height());
	}
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

//A device to debug a browser device.
function BrowserDebugDevice(name, hook, devicesToDebug) {
	if (!(hook instanceof BrowserDevice))
		throw new Error('hook is not a BrowserDevice');
	
	this.name = name;
	this.id = hook.id;
	this.graphicsAPI = hook.graphicsAPI;
	this.hook = hook;
	this.devicesToDebug = devicesToDebug;
	this.requestAnimationFrame = window.requestAnimationFrame.bind(window);
	this.isDebugDevice = true;
}

BrowserDebugDevice.prototype = new Device;

BrowserDebugDevice.prototype.init = function() {
	this.canvas = document.getElementById(this.id);
	this.ctx = this.canvas.getContext('2d');	
	return true;
};

BrowserDebugDevice.prototype.clear = function() {
	return this.hook.clear();
};

BrowserDebugDevice.prototype.height = function() {
	return this.hook.height();
};

BrowserDebugDevice.prototype.width = function() {
	return this.hook.width();
};

BrowserDebugDevice.prototype.addEventListener = function(eventName, callback) {
	this.hook.addEventListener(eventName, callback);
};

BrowserDebugDevice.prototype.emitEvent = function(eventName, evt) {
	this.hook.emitEvent(eventName, evt);
};

BrowserDebugDevice.prototype.defineKey = function(keyCharacter, keyType, keyName) {
	this.hook.defineKey(keyCharacter, keyType, keyName);
};

BrowserDebugDevice.prototype.defineKeys = function(keys) {
	this.hook.defineKeys(keys);
};

BrowserDebugDevice.prototype.isKeyHeld = function(keyName) {
	return this.hook.isKeyHeld(keyName);
};

BrowserDebugDevice.prototype.pressKey = function(keyCode) {
	this.hook.pressKey(keyCode);
};

BrowserDebugDevice.prototype.unpressKey = function(keyCode) {
	this.hook.unpressKey(keyCode);
};

BrowserDebugDevice.prototype.addInputListener = function(keyName, callback) {
	this.hook.addInputListener(keyName, callback);
};

