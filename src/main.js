window.requestAnimationFrame = 
	window.requestAnimationFrame ||			// Chrome
	window.mozRequestAnimationFrame ||		// Firefox
	window.webkitRequestAnimationFrame;		// Safari

//async load various assets: images, etc.
function acquireAssets(callback) {
	//device: what handles draw and input


	//game assets: things the game needs to run
	var assets = {
		//paddle: new Paddle(),
		//ball: new Ball(),
		//bricks: new Bricks()
	};

	var collection = {
		assets: assets
	};
	
	callback(collection);
}

window.onload = function() {
	acquireAssets(function(collection) {
		var breakoutDevice = new BrowserDevice('breakout', 16.666);
		var panelDevice = new BrowserDevice('panel', 16.666);

		var debugDevice = new BrowserDebugDevice('debug', breakoutDevice, [
			breakoutDevice, panelDevice
		]);
		
		var env = new Environment({
			name: 'breakout',
			devices: [ breakoutDevice, panelDevice, debugDevice ],
			assets: collection.assets,
			associations: {
				breakout: Breakout,
				panel: BreakoutPanel,
				debug: Debug
			}
		});

		
		env.start();
	});
};

