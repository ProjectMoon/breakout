var util = {};

//hb1 and hb2 are hitboxes.
util.collidesWithRect = function(hb1, hb2) {
	return util.rectangleIntersection(hb1, hb2);
};

util.rectangleIntersection = function(r1, r2) {
	return !(r2.left > r1.right || 
				r2.right < r1.left || 
				r2.top > r1.bottom ||
				r2.bottom < r1.top);
};
