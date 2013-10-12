function Game() {}

//What graphics do we support?
Game.prototype.supportedGraphics = [];

Game.prototype.init = function(device, assets) {
	console.log('Warning: Game init not overridden.');
};

Game.prototype.update = function(device, du) {
	console.log('Warning: Game update not overridden.');
};

Game.prototype.render = function(device) {
	console.log('Warning: Game render not overridden.');
};
