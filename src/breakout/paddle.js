function Paddle() {
	this.x = 100;
	this.y = 700;
	this.vel = 10;

	this.movingRight = false;
	this.movingLeft = false;
}


Paddle.prototype.halfWidth = 50;
Paddle.prototype.halfHeight = 10;

Paddle.prototype.update = function (device, du) {
	if (device.isKeyHeld(MOVE_RIGHT)) {
		if (this.x + this.halfWidth + 5 < device.width()) {
			this.x += this.vel * du;
		}
	}
	
	if (device.isKeyHeld(MOVE_LEFT)) {
		if (this.x - this.halfWidth - 5 > 0) {
			this.x -= this.vel * du;
		}
	}
};

Paddle.prototype.render = function (device) {
	 device.ctx.fillRect(this.x - this.halfWidth,
								this.y - this.halfHeight,
								this.halfWidth * 2,
								this.halfHeight * 2);
};

Paddle.prototype.collidesWith = function (prevX, prevY, nextX, nextY, r) {
	 var paddleEdge = this.x;
	 // Check X coords
	 if ((nextX - r < paddleEdge && prevX - r >= paddleEdge) ||
		  (nextX + r > paddleEdge && prevX + r <= paddleEdge)) {
		  // Check Y coords
		  if (nextY + r >= this.y - this.halfHeight &&
				nextY - r <= this.y + this.halfHeight) {
				// It's a hit!
				return true;
		  }
	 }
	 // It's a miss!
	 return false;
};

Paddle.prototype.hitbox = function() {
	var rect = {
		left: this.x - this.halfWidth,
		top: this.y - this.halfHeight,
		right: this.x + this.halfWidth * 2,
		bottom: this.y + this.halfHeight * 2,
		height: this.halfHeight * 2,
		width: this.halfWidth * 2
	};

	return rect;
};

Paddle.prototype.collidesWithRect = function(rect) {
	var thisRect = this.hitbox();
	return rectangleIntersection(thisRect, rect);
};

function rectangleIntersection(r1, r2) {
 return !(r2.left > r1.right || 
		r2.right < r1.left || 
		r2.top > r1.bottom ||
		r2.bottom < r1.top);
}
