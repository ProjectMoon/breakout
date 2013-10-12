var BRICK_COLORS = {
	YELLOW: '#FFFF00',
	GREEN: '#00FF00',
	ORANGE: '#FF9900',
	RED: '#FF0000'
};

function Bricks() {
	this.bricks = [];
	this.topSpace = 100;
	this.spacing = 2;
	this.brickHeight = 15;
	this._makeLevel();
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

Bricks.prototype._makeLevel = function() {
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
			}

			x += brickWidth + this.spacing;
		}
	}

	ctx.restore();
};
