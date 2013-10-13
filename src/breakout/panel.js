var panelbricks = new Bricks();

function BreakoutPanel() {
	console.log('BreakoutPanel loaded.');
	this.gameOver = false;
}

BreakoutPanel.prototype = new Game;

//What graphics do we support?
BreakoutPanel.prototype.supportedGraphics = [ 'canvas2d' ];

//keynames

//methods
BreakoutPanel.prototype.init = function(assoc) {
	var device = assoc.device;

	var self = this;
	assoc.setMessageListener('gameOver', function() {
		self.gameOver = this;
	});


	assoc.setMessageListener('upcomingBricks', function(bricks) {
		//turning it into a 2d array here for the method.
		panelbricks.setBricks([ bricks ]);
		setTimeout(function() {
			//sending 0 because the first row is actually the preview.
			assoc.sendMessage('breakout', 'newBricks', panelbricks.bricks[0]);
			panelbricks.setBricks(null);
		}, 8 * 1000);
	});
};

BreakoutPanel.prototype.update = function(device, du) {
	if (this.gameOver) return;

};

BreakoutPanel.prototype.render = function(device) {
	device.clear();

	var ctx = device.ctx;

	//render score
	//score
	ctx.save();
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = 'bold 30px arial';
	ctx.fillText(totalScore, device.width() / 2, 15);
	ctx.restore();
	
	//render upcoming bricks
	panelbricks.render(device);
};

