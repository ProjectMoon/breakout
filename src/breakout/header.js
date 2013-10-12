//key names
var MOVE_LEFT = 'MOVE_LEFT';
var MOVE_RIGHT = 'MOVE_RIGHT';
var LAUNCH = 'LAUNCH';

//key bindings
var BINDS = {
	A: [ Device.KEY_TYPE_HOLD, MOVE_LEFT ],
	D: [ Device.KEY_TYPE_HOLD, MOVE_RIGHT ],
	' ': [ Device.KEY_TYPE_EMIT_ONCE, LAUNCH ]
};

//event names
var HIT_BOTTOM = 'hitBottom';
var HIT_BRICK = 'hitBrick';
