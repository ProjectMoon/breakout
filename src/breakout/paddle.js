function Paddle() {
	this.x = 100;
	this.y = 700;
}

Paddle.prototype.update = function(device, du) {
	if (device.isKeyHeld(MOVE_LEFT)) {
		this.x -= 2 * du;
	}

	if (device.isKeyHeld(MOVE_RIGHT)) {
		this.x += 2 * du;
	}
};

Paddle.prototype.render = function(device) {
	var ctx = device.ctx;

	ctx.save();

	ctx.fillRect(this.x, this.y, 100, 20);

	ctx.restore();
};
