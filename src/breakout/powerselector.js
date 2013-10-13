function PowerSelector() {
	this.powers = [ 'deathray', 'ubermode', 'slowtime' ];
	this.selected = 0;
}

PowerSelector.prototype.getSelected = function() {
	return this.powers[selected];
};

PowerSelector.prototype.move = function(amount) {
	if (this.selected + amount >= 0 &&
		 this.selected + amount <= this.powers.length) {

		this.selected += amount;
	}
};

PowerSelector.prototype.render = function(device) {
	var boxWidth = 100;
	var halfWidth = boxWidth / 2;
	var boxHeight = 50;
	var halfHeight = boxHeight / 2;

	var ctx = device.ctx;
	var x = 0;
	var y = device.height() - halfHeight;
	for (var c = 0; c < this.powers.length; c++) {
		var power = this.powers[c];
		ctx.save();

		//selected power is highlighted blue
		if (c == this.selected) {
			ctx.save();
			ctx.strokeStyle = 'blue';
			ctx.fillStyle= '#BBBBFF';
			ctx.fillRect(x, y - halfHeight, boxWidth, boxHeight);
			ctx.restore();
		}
		
		ctx.strokeRect(x, y - halfHeight, boxWidth, boxHeight);
		ctx.textAlign = 'center';
		ctx.fillText(power, x + halfWidth, y);
		
		ctx.restore();
		x += boxWidth;
	}
};
