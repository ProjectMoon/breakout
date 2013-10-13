//key names
var MOVE_LEFT = 'MOVE_LEFT';
var MOVE_RIGHT = 'MOVE_RIGHT';
var LAUNCH = 'LAUNCH';
var POWER_LEFT = 'POWER_LEFT';
var POWER_RIGHT = 'POWER_RIGHT';
var QUIT = 'QUIT';

//debug key names
var STOP_CLEAR = 'STOP_CLEAR';
var PAUSE = 'PAUSE';
var STEP = 'STEP';
var FLIP_FLOP = 'FLIP_FLOP';
var SHOW_TIMERS = 'SHOW_TIMERS';
var RENDER = 'RENDER';
var DRAW_BOX = 'DRAW_BOX';

//key bindings
var BINDS = {
	A: [ Device.KEY_TYPE_HOLD, MOVE_LEFT ],
	D: [ Device.KEY_TYPE_HOLD, MOVE_RIGHT ],
	' ': [ Device.KEY_TYPE_EMIT_ONCE, LAUNCH ],
	J: [ Device.KEY_TYPE_EMIT_ONCE, POWER_LEFT ],
	K: [ Device.KEY_TYPE_EMIT_ONCE, POWER_RIGHT ],
	Q: [ Device.KEY_TYPE_EMIT_ONCE, QUIT ]
};
/*
  - replicate the debug stuff in the pong framework:
    * C = stop clearing
    * P = pause
    * O = single step if paused.
    * F = weird debug frame thingy
    * Q = quit (gameover)
    * T = show timers (current time, delta, previous time)
    * R = toggle rendering
    * B = draw a red box
 */
var DEBUG_BINDS = {
	C: [ Device.KEY_TYPE_TOGGLE, STOP_CLEAR ],
	P: [ Device.KEY_TYPE_TOGGLE, PAUSE ],
	O: [ Device.KEY_TYPE_EMIT_ONCE, STEP ],
	F: [ Device.KEY_TYPE_TOGGLE, FLIP_FLOP ],
	T: [ Device.KEY_TYPE_TOGGLE, SHOW_TIMERS ],
	R: [ Device.KEY_TYPE_TOGGLE, RENDER ],
	B: [ Device.KEY_TYPE_TOGGLE, DRAW_BOX ]
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
