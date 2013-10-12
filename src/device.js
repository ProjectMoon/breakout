/**
 * A Device thinly abstracts the graphics and input handling of
 * whatever we are running on. Most commonly, abstracts the browser
 * canvas element and its associated graphics APIs.
 */
function Device() {
	this.keys = {};
	this._namesToKeys = {};
}

//Keyboard handling.
//types of key events. only support hold for now.
Device.KEY_TYPE_HOLD = 0;

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

Device.prototype.pressKey = function(keyCode) {
	if (this.keys[keyCode]) {
		this.keys[keyCode].pressed = true;
	}
	else {
		console.log('No binding for ' + String.fromCharCode(keyCode));
	}
};

Device.prototype.unpressKey = function(keyCode) {
	if (this.keys[keyCode]) {
		this.keys[keyCode].pressed = false;
	}
	else {
		console.log('No binding for ' + String.fromCharCode(keyCode));
	}
};

/**
 * Responsible for initializing the device's keyboard and garphics
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

/**
 * A basic device implementation for the browser.
 */
function BrowserDevice(id, refreshRate) {
	//set a custom property and the refresh rate.
	this.id = id;
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
