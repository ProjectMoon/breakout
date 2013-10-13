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
	assoc.setMessageListener('gameOver', function(state) {
		self.gameOver = state;
	});


	assoc.setMessageListener('upcomingBricks', function(bricks) {
		//bricks come in as a ready-to-go 2d array.
		panelbricks.setBricks(bricks);
		setTimeout(function() {
			if (!self.gameOver) {
				assoc.sendMessage('breakout', 'newBricks', panelbricks.bricks);
				panelbricks.setBricks(null);
			}
		}, 8 * 1000);
	});
};

BreakoutPanel.prototype.update = function(device, du) {
	if (this.gameOver) return;

};

BreakoutPanel.prototype.render = function(device) {
	if (this.gameOver) return;
	
	device.clear();

	var ctx = device.ctx;

	//render score and level
	ctx.save();
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = 'bold 30px arial';
	ctx.fillText(globals.totalScore, device.width() / 2, 15);
	
	ctx.fillText('L: ' + globals.level, device.width() / 2, 45);
	ctx.fillText('Upcoming', device.width() /2, 80);
	ctx.restore();
	
	//render upcoming bricks
	ctx.save();
	ctx.translate(0, panelbricks.topSpace);
	ctx.fillStyle = '#DDDDDD';
	ctx.fillRect(0, 0, device.width(), device.height() / 3);
	ctx.restore();
	panelbricks.render(device);
};

