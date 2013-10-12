function Ball(paddle, device) {
	this.paddle = paddle;
	this.device = device;
	this.x = 100;
	this.y = 650;
	this.radius = 8;
	this.xVel = 5;
	this.yVel = 3;
	this.inCollision = false;
}

Ball.prototype.hitbox = function() {
	var rect = {};
	rect.left = this.x - this.radius;
	rect.top = this.y - this.radius;
	rect.right = rect.left + this.radius * 2;
	rect.bottom = rect.top + this.radius * 2;
	rect.width = this.radius * 2;
	rect.height = this.radius * 2;
	return rect;
};

Ball.prototype.updateForCollision = function(paddle) {
	if (paddle.collidesWithRect(this.hitbox())) {
		if (!this.inCollision) {
			this.yVel *= -1;
			this.inCollision = true;
		}
	}
	else {
		this.inCollision = false;
	}
};

Ball.prototype.update = function (device, du) {
	this.updateForCollision(this.paddle);

	// Remember my previous position
	var prevX = this.x;
	var prevY = this.y;
	
	// Compute my provisional new position (barring collisions)
	var nextX = prevX + this.xVel * du;
	var nextY = prevY + this.yVel * du;
										 	 
	 // Bounce off top and bottom edges
	 if (nextY < 0 ||										 // top edge
		  nextY > device.height()) {					 // bottom edge
		  this.yVel *= -1;
	 }

	// bounce off left and right edges, also scoring
	if (nextX < 0) {
		this.xVel *= -1;
	}
	
	if (nextX > device.width()) {
		this.xVel *= -1;
	}

	 // Reset if we fall off the left or right edges
	 // ...by more than some arbitrary `margin`
	 //
	 var margin = 4 * this.radius;
	 if (nextX < -margin || 
		  nextX > device.width() + margin) {
		  this.reset();
	 }

	 // *Actually* update my position 
	 // ...using whatever velocity I've ended up with
	 //
	 this.x += this.xVel;
	 this.y += this.yVel;
};

Ball.prototype.render = function(device) {
	var ctx = device.ctx;
	ctx.save();
	ctx.fillStyle = 'black';
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
};
