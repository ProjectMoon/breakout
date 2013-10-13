/*
TODO:
 - replicate the debug stuff in the pong framework:
    * C = stop clearing
    * Q = quit (gameover)
    * B = draw a red box
 */

function Debug() {
	console.log('Debug module loaded.');
	this.gameOver = false;
	this.showTimers = false;
	this.flipflop = false;
	this.drawbox = false;
	this.undobox = false;
	this.frameCount = 0;
}

Debug.prototype = new Game;

//What graphics do we support?
Debug.prototype.supportedGraphics = [ 'canvas2d' ];

//keynames

//methods
Debug.prototype.init = function(assoc) {
	var device = assoc.device;
	var self = this;
	
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

	device.addInputListener(SHOW_TIMERS, function(evt) {
		self.showTimers = evt.toggle;
	});

	device.addInputListener(FLIP_FLOP, function(evt) {
		self.flipflop = evt.toggle;
	});

	device.addInputListener(DRAW_BOX, function(evt) {
		self.drawbox = evt.toggle;
	});

	device.addInputListener(UNDO_BOX, function(evt) {
		self.undobox = evt.toggle;
	});
};

Debug.prototype.update = function(device, du) {
	if (this.gameOver) return;
	this.frameCount++;
};

Debug.prototype.render = function(device) {
	if (this.gameOver) return;

	var ctx = device.ctx;
	
	if (this.showTimers) {
		var y = 350;
		var assocNames = Object.keys(device.assocs);
		
		assocNames.forEach(function(assocName) {
			var assoc = device.assocs[assocName];
			ctx.fillText(assocName, 50, y);
			ctx.fillText('FT ' + assoc.clock.time, 50, y+10);
			ctx.fillText('FD ' + assoc.clock.delta, 50, y+20);
			ctx.fillText('UU ' + assoc.clock.prevDU, 50, y+30); 
			ctx.fillText('FrameSync ON', 50, y+40);
			y += 60;
		});
	}

	if (this.flipflop) {
      var boxX = 250,
          boxY = (this.frameCount % 2 == 0) ? 100 : 200;
      
      // Draw flip-flop box
      this._fillBox(ctx, boxX, boxY, 50, 50, "green");
      
      // Display the current frame-counter in the box...
      ctx.fillText(this.frameCount % 1000, boxX + 10, boxY + 20);
      // ..and its odd/even status too
      var text = this.frameCount  % 2 ? "odd" : "even";
      ctx.fillText(text, boxX + 10, boxY + 40);
	}

	if (this.drawbox) {
		this._fillBox(ctx, 200, 200, 50, 50, "red");
	}

	if (this.undobox) {
		ctx.clearRect(200, 200, 50, 50);
	}
};

Debug.prototype._fillBox = function fillBox(ctx, x, y, w, h, style) {
    var oldStyle = ctx.fillStyle;
    ctx.fillStyle = style;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = oldStyle;
};
