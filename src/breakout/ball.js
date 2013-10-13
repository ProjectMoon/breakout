function Ball(paddle, bricks, device) {
	this.paddle = paddle;
	this.device = device;
	this.bricks = bricks;

	this.power = 1; //how much damage it does to blocks
	this.radius = 8;
	this.speed = 10;
	this.xVel = 0;
	this.yVel = 0;
	this.inCollision = false;

	//various powerups that affect the ball
	this.ubermode = false;
	this.slowtime = false;
	
	//ball appears on center of paddle first.
	this.launched = false;
	this.centerToPaddle();
}

Ball.prototype.centerToPaddle = function() {
	//-3 because otherwise it immediately collides and goes nuts.
	this.x = paddle.x;
	this.y = paddle.y - paddle.height + (this.radius / 2) - 3;
};

Ball.prototype.launch = function() {
	this.xVel =  10;
	this.yVel = -10;
	this.launched = true;
	this.inCollision = true;
};

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

Ball.prototype.updateForCollision = function(paddle, device) {
	if (paddle.collidesWithRect(this.hitbox())) {
		if (!this.inCollision) {
			//change x vel based on distance from paddle center.
			//paddle.x is the center of the paddle.
			var dist = paddle.x - this.x;
			var percentDist = dist * util.getRandomNumber(.5, 2) / paddle.width;
			this.xVel *= percentDist * this.speed;
			if (this.xVel > this.speed) this.xVel = this.speed;
			if (this.xVel < -this.speed) this.xVel = -this.speed;

			if (this.x < paddle.x) this.xVel = -Math.abs(this.xVel);
			else this.xVel = Math.abs(this.xVel);

			this.yVel *= -1;
			
			this.inCollision = true;
		}
	}
	else {
		this.inCollision = false;
	}
	
	//here we don't want to take into account spacing due
	//to hitboxes.
	var bricks = this.bricks.bricks;
	var width = device.width();
	var brickWidth = (width / bricks[0].length);
	var brickHeight = this.bricks.brickHeight;

	outer:
	for (var r = 0; r < bricks.length; r++) {
		var row = bricks[r];
		for (var c = 0; c < row.length; c++) {
			var brick = bricks[r][c];

			//only check if a brick is actually there...
			if (brick) {
				var hitbox = this.bricks.getHitbox(r, c, brickWidth, brickHeight);
				var ballHitbox = this.hitbox();
				
				if (util.collidesWithRect(hitbox, ballHitbox)) {
					if (!this.inCollision) {
						this.inCollision = true;
						var evt = { r: r, c: c, brick: brick };
						device.emitEvent(HIT_BRICK, evt);

						//if not in ubermode, bounce as expected.
						//otherwise we would instead plow on through.
						if (!this.ubermode) {
							this.yVel *= -1;
						}
						
						break outer;
					}
					else {
						this.inCollision = false;
					}
				}
			}
		}
	}
};

Ball.prototype.update = function (device, du) {
	//if we have not launched, move with the paddle.
	if (!this.launched) {
		this.centerToPaddle();
		return;
	}

	//set the y velocity to the current speed.
	//x velocity possibly gets changed by collisions.
	//y velocity never actually changes except for negative flipping.
	this.yVel > 0 ? this.yVel = this.speed : this.yVel = -this.speed;
	
	this.updateForCollision(this.paddle, device);

	// Remember my previous position
	var prevX = this.x;
	var prevY = this.y;
	
	// Compute my provisional new position (barring collisions)
	var nextX = prevX + this.xVel * du;
	var nextY = prevY + this.yVel * du;
	
	// Bounce off top edge
	if (nextY < 0) {
		this.yVel *= -1;
	}
	
	//bottom edge equals event
	if (nextY + this.radius > device.height() - BOTTOM_OFFSET) {
		device.emitEvent(HIT_BOTTOM);
	 }

	// bounce off left and right edges
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
