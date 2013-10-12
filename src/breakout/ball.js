function Ball(paddle, env) {
	this.paddle = paddle;
	this.env = env;
	this.x = 100;
	this.y = 100;
	this.xVel = 5;
	this.yVel = 3;
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

Ball.prototype.disablePaddleCollisionsUntil = function(condition) {
	this.allowPaddleCollision = false;
	if (condition()) {
		this.allowPaddleCollision = true;
	}
	else {
		var self = this;
		setTimeout(function() {
			self.disablePaddleCollisionsUntil(condition);
		}, this.env.device.refreshRate);
	}
};

Ball.prototype.updateForCollision = function(paddle) {
	// Remember my previous position
	var prevX = this.x;
	var prevY = this.y;
	
	// Compute my provisional new position (barring collisions)
	var nextX = prevX + this.xVel;
	var nextY = prevY + this.xVel;

	//solving the problem of ball phasing when paddle going sideways:
	//-- not perfect, notably with the slower ball.
	//   - mostly due to the simple negation of x velocity, so you
	//     can do weird things like hit the ball from behind and have
	//     it go the opposite direction (not very intuitive).
	//
	//1. switch to rectangle collision detection, as a collision is
	//   always apparently detected in this instance.
	//2. do not permit any velocity changes while still colliding after
	//   the first collision has already happened. necessary so the ball
	//   doesn't get stuck inside the rectangle hitbox.
	//3. disable paddle collisions with this ball while the paddle that
	//   hit it is still colliding rectangly. necessary mostly for the
	//   slower ball, as the paddle can move past it and thus finish
	//   the #2 condition, but produce behavior as if #2 was not
	//   implemented.
	if (this.allowPaddleCollision) {
		if (!paddle.movingLeft && !paddle.movingRight) {
			if (paddle.collidesWith(prevX, prevY, nextX, nextY, this.radius)) {
				if (!this.inCollision) {
					this.inCollision = true;
					this.xVel *= -1;
				}
			}
			else {
				this.inCollision = false;
			}
		}
		else {
			if (paddle.collidesWithRect(this.hitbox())) {
				if (!this.inCollision) {
					this.inCollision = true;
					this.xVel *= -1;
					
					if (paddle.movingLeft || paddle.movingRight) {
						var self = this;
						var condition = (function() {
							return !this.collidesWithRect(self.hitbox());
						}).bind(paddle);

						this.disablePaddleCollisionsUntil(condition);
					}
				}
			}
			else {
				this.inCollision = false;
			}		
		}
	}
};

Ball.prototype.update = function (device, du) {
	//this.updateForCollision(g_paddle1);
	//this.updateForCollision(g_paddle2);

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
	ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
};
