window.requestAnimationFrame = 
	window.requestAnimationFrame ||			// Chrome
	window.mozRequestAnimationFrame ||		// Firefox
	window.webkitRequestAnimationFrame;		// Safari

//async load various assets: images, etc.
function acquireAssets(callback) {
	//device: what handles draw and input
	var device = new BrowserDevice('canvas', 16.666, 400, 400);

	//game assets: things the game needs to run
	var assets = {
		//paddle: new Paddle(),
		//ball: new Ball(),
		//bricks: new Bricks()
	};

	var collection = {
		device: device,
		assets: assets
	};
	
	callback(collection);
}

window.onload = function() {
	acquireAssets(function(collection) {	
		Environment.describe('breakout', {
			device: collection.device,
			assets: collection.assets,
			game: Breakout
		});
		
		Environment.start('breakout');
	});
};

