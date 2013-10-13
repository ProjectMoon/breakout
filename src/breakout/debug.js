/*
TODO:
 - replicate the debug stuff in the pong framework:
    * C = stop clearing
    * P = pause
    * O = single step if paused.
    * F = weird debug frame thingy
    * Q = quit (gameover)
    * T = show timers (current time, delta, previous time)
    * R = toggle rendering
    * B = draw a red box
 */

function Debug() {
	console.log('Debug module loaded.');
	this.gameOver = false;
}

Debug.prototype = new Game;

//What graphics do we support?
Debug.prototype.supportedGraphics = [ 'canvas2d' ];

//keynames

//methods
Debug.prototype.init = function(assoc) {
	var device = assoc.device;
	device.defineKeys(DEBUG_BINDS);

	device.addInputListener(PAUSE, function(evt) {
		console.log('pausing ' + evt.toggle);
		if (evt.toggle == true) {
			device.devicesToDebug.forEach(function(deviceToDebug) {
				deviceToDebug.pause();
			});
		}
		else {
			device.devicesToDebug.forEach(function(deviceToDebug) {
				deviceToDebug.unpause();
			});
		}
	});

	device.addInputListener(STEP, function(evt) {
		console.log('step');
		device.devicesToDebug.forEach(function(deviceToDebug) {
			deviceToDebug.queueStep();
		});
	});

	device.addInputListener(STOP_RENDER, function(evt) {
		device.devicesToDebug.forEach(function(deviceToDebug) {
			if (evt.toggle == true) {
				deviceToDebug.disableRendering();
			}
			else {
				deviceToDebug.enableRendering();
			}
		});
	});

	device.addInputListener(STOP_CLEAR, function(evt) {
		device.devicesToDebug.forEach(function(deviceToDebug) {
			if (evt.toggle == true) {
				deviceToDebug.disableClearing();
			}
			else {
				deviceToDebug.enableClearing();
			}
		});
	});
};

Debug.prototype.update = function(device, du) {
	if (this.gameOver) return;

};

Debug.prototype.render = function(device) {
	if (this.gameOver) return;

};

