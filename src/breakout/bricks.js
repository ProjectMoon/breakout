var BRICK_COLORS = {
	YELLOW: '#FFFF00',
	GREEN: '#00FF00',
	ORANGE: '#FF9900',
	RED: '#FF0000'
};

function Bricks() {
	this.empty();
	this.topSpace = 100;
	this.spacing = 2;
	this.brickHeight = 15;
}

Bricks.prototype._makeBrick = function(color) {
	var life = 1;
	if (color == BRICK_COLORS.RED) life = 2;
	var points = 1;

	switch (color) {
		case BRICK_COLORS.GREEN:
		points = 3;
		break;
		case BRICK_COLORS.ORANGE:
		points = 5;
		break;
		case BRICK_COLORS.RED:
		points = 7;
		break;
	}
	
	return {
		color: color,
		life: life,
		points: points
	};
};

Bricks.prototype.makeLevel = function() {
	for (var c = 0; c < 8; c++) {
		this.bricks[c] = [];

		for (var x = 0; x < 10; x++) {
			switch (c) {
				case 0:
				case 1:
				this.bricks[c][x] = this._makeBrick(BRICK_COLORS.RED);
				break;
				case 2:
				case 3:
				this.bricks[c][x] = this._makeBrick(BRICK_COLORS.ORANGE);
				break;
				case 4:
				case 5:
				this.bricks[c][x] = this._makeBrick(BRICK_COLORS.GREEN);
				break;
				case 6:
				case 7:
				this.bricks[c][x] = this._makeBrick(BRICK_COLORS.YELLOW);
				break;
			}
		}
	}
};

Bricks.prototype.newRows = function(level, full) {
	if (full == undefined) full = false;
	if (level < 1) level = 1;

	//make level / 2 rows, up to a maximum of 8. unless we just
	//advanced a level, then we make something special.
	if (full) {
		var numRows = level;
	}
	else {
		var numRows = Math.floor(level / 2);
		if (numRows < 1) numRows = 1;
		if (numRows > 8) numRows = 8;
	}

	var newRows = [];

	for (var r = 0; r < numRows; r++) {
		var newRow = [];
		var colorNames = Object.keys(BRICK_COLORS);
		
		for (var c = 0; c < 10; c++) {
			//> 3 = no brick.
			var num = util.getRandomInt(0, 6);
			if (num < colorNames.length) {
				var color = colorNames[num];
				newRow.push(this._makeBrick(BRICK_COLORS[color]));
			}
			else {
				newRow.push(null);
			}
		}

		newRows.push(newRow);
	}

	return newRows;
};

Bricks.prototype.addBricksToTop = function(bricks) {
	//need to put them on top in reverse so it matches the preview.
	for (var c = bricks.length - 1; c >= 0; c--) {
		var row = bricks[c];
		this.bricks.unshift(row);
	}
};

Bricks.prototype.empty = function() {
	this.bricks = [];
	this.bricks[0] = [];
};

Bricks.prototype.setBricks = function(bricks) {
	if (bricks != null && bricks != undefined) {
		this.bricks = bricks;
	}
	else {
		this.empty();
	}
};

Bricks.prototype.hasBricks = function() {
	return !(this.bricks.length == 1 && this.bricks[0].length == 0);
};

Bricks.prototype.getHitbox = function(r, c, brickWidth, brickHeight) {
	var x = c * brickWidth;
	var y = (r * brickHeight) + this.topSpace;

	var halfWidth = brickWidth / 2;
	var halfHeight = brickHeight / 2;
	var rect = {
		left: x - halfWidth,
		top: y - halfHeight,
		right: x + brickWidth,
		bottom: y + brickHeight * 2, //not so sure about this.
		height: brickHeight,
		width: brickWidth
	};

	return rect;
};

Bricks.prototype.update = function(device) {

};

Bricks.prototype.render = function(device) {
	var width = device.width();
	var height = device.height();

	var brickWidth = (width / this.bricks[0].length) - this.spacing;
	var brickHeight = this.brickHeight - this.spacing;

	var ctx = device.ctx;
	var x = 0, y = 0;

	ctx.save();
	ctx.translate(0, this.topSpace);
	for (var r = 0; r < this.bricks.length; r++) {
		x = 0;
		y += brickHeight + this.spacing;
		var row = this.bricks[r];
		for (var c = 0; c < row.length; c++) {
			var brick = this.bricks[r][c];

			if (brick) {
				ctx.fillStyle = brick.color;
				ctx.strokeStyle = '#333333';
				ctx.fillRect(x, y, brickWidth, brickHeight);
				ctx.strokeRect(x, y, brickWidth, brickHeight);

				//this should definitely be in the update method,
				//but it's easier to put it here than refactoring.
				if (y + brickHeight > height - BOTTOM_OFFSET) {
					device.emitEvent(HIT_BOTTOM);
				}
			}

			x += brickWidth + this.spacing;
		}
	}

	ctx.restore();
};
