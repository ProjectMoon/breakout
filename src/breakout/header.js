//key names
var MOVE_LEFT = 'MOVE_LEFT';
var MOVE_RIGHT = 'MOVE_RIGHT';
var LAUNCH = 'LAUNCH';
var POWER_LEFT = 'POWER_LEFT';
var POWER_RIGHT = 'POWER_RIGHT';

//key bindings
var BINDS = {
	A: [ Device.KEY_TYPE_HOLD, MOVE_LEFT ],
	D: [ Device.KEY_TYPE_HOLD, MOVE_RIGHT ],
	' ': [ Device.KEY_TYPE_EMIT_ONCE, LAUNCH ],
	J: [ Device.KEY_TYPE_EMIT_ONCE, POWER_LEFT ],
	K: [ Device.KEY_TYPE_EMIT_ONCE, POWER_RIGHT ]
};

//event names
var HIT_BOTTOM = 'hitBottom';
var HIT_BRICK = 'hitBrick';

//constants

//how much to offset the bottom from the real bottom.
var BOTTOM_OFFSET = 85;

var globals = {
	totalScore: 0,
	levelScore: 0,
	level: 10
};
