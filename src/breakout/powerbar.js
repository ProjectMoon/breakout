function Powerbar(power) {
	this.power = power;
	this.maxPower = 10;
	this.poweredup = false;
	this.locked = {};
	this.groups = [ 'default' ];
}

Powerbar.prototype.add = function(power, group) {
	if (group == undefined) group = 'default';
	if (!this.poweredup && !this.isMaxPower()) {
		if (!this.locked[group] || power < 0) {
			this.power += power;
		}
	}
};

Powerbar.prototype.isMaxPower = function() {
	return this.power >= this.maxPower;
};

Powerbar.prototype.powerup = function() {
	if (this.isMaxPower()) {
		this.power = 0;
		this.poweredup = true;
		return true;
	}
	else {
		return false;
	}
};

Powerbar.prototype.lock = function(time, group) {
	if (group == undefined) group = 'default';
	this.locked[group] = true;
	var self = this;
	setTimeout(function() {
		self.locked[group] = false;
	}, time * 1000);
};

Powerbar.prototype.expire = function(callback, time) {
	var self = this;

	setTimeout(function() {
		self.poweredup = false;
		callback();
	}, time * 1000);
};

Powerbar.prototype.render = function(device) {
	var width = device.width();
	var height = device.height();
	var ctx = device.ctx;
	var barHeight = 30;
	var above = 50;

	var filledWidth = (this.power / this.maxPower) * width;

	ctx.save();

	ctx.strokeStyle = '#555555';
	ctx.strokeRect(0, height - barHeight - above, width, barHeight);
	ctx.fillStyle = '#0055AA';
	ctx.fillRect(0, height - barHeight - above, filledWidth, barHeight);

	if (this.isMaxPower()) {
		ctx.textAlign = 'center';
		ctx.fillStyle = 'white';
		ctx.font = 'italic bold 14px arial';
		
		ctx.fillText('Ready to use power!', width / 2, height - barHeight * 2);
	}
		
	ctx.restore();
};
