var panelbricks = new Bricks();

function BreakoutPanel() {
	console.log('BreakoutPanel loaded.');
	this.gameOver = false;
	this.brickTime = 0;
}

BreakoutPanel.prototype = new Game;

//What graphics do we support?
BreakoutPanel.prototype.supportedGraphics = [ 'canvas2d' ];

BreakoutPanel.prototype.getMaxBrickTime = function() {
	var maxTime =  900 - (globals.level * 50);
	if (maxTime < 400) maxTime = 400;
	return maxTime;
};

BreakoutPanel.prototype.init = function(assoc) {
	this.assoc = assoc;
	var device = assoc.device;

	var self = this;
	assoc.setMessageListener('gameOver', function(state) {
		self.gameOver = state;
	});

	assoc.setMessageListener('upcomingBricks', function(bricks) {
		//bricks come in as a ready-to-go 2d array.
		panelbricks.setBricks(bricks);
	});

	assoc.setMessageListener('respawn', function() {
		self.gameOver = false;
		panelbricks.setBricks(null);
		self.brickTime = 0;
	});
};

BreakoutPanel.prototype.update = function(device, du) {
	if (this.gameOver) return;

	//originally was configured to message pass back after 8 sec, via
	//setTimeout but to work with pausing we must use update instead.
	if (panelbricks.hasBricks()) {
		this.brickTime += du;

		if (this.brickTime > this.getMaxBrickTime()) {
			this.assoc.sendMessage('breakout', 'newBricks', panelbricks.bricks);
			panelbricks.setBricks(null);
			this.brickTime = 0;
		}
	}
};

BreakoutPanel.prototype.render = function(device) {
	if (this.gameOver) return;

	device.clear();

	if (!device.isRenderingEnabled()) return;
	
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

	//render upcoming bricks (preview box)
	ctx.save();
	ctx.translate(0, panelbricks.topSpace);
	ctx.fillStyle = '#DDDDDD';
	ctx.fillRect(0, 0, device.width(), device.height() / 3);
	ctx.restore();
	panelbricks.render(device);

	//render upcoming timer
	ctx.save();
	var filledWidth = (this.brickTime / this.getMaxBrickTime()) * device.width();
	ctx.fillStyle = '#AAAAFF';
	ctx.fillRect(0, panelbricks.topSpace, filledWidth, 10);
	ctx.restore();

	//render previous score
	if (globals.games > 0) {
		ctx.save();
		ctx.font = 'bold 12px arial';
		var y = 400;
		for (var c = globals.previousScores.length - 1; c >= 0; c--) {
			var prevScore = globals.previousScores[c];
			var score = prevScore.score;
			var level = prevScore.level;
			var num = globals.previousScores.length - c;
			ctx.fillText(num + ': ' + score + ' (' + level + ')', 1, y);
			y += 20;
		}

		ctx.restore();
	}
};

