/*!
 * util
 *
 * Utility functions
 */

/**
 * Module dependencies.
 */

var ndarray = require('ndarray'),
    ops = require('ndarray-ops'),
    temp = ndarray(new Float32Array(2));

/**
 * Module exports.
 */

/**
 * .deltaRotation
 *
 * returns the smallest delta rotation between two angles
 *
 * @param: {Number} angle, radians
 * @param: {Number} target, radians
 * @return: {Number} delta
 */
exports.deltaRotation = function (angle, target) {
  return exports.normalizeRotation(angle - target);
};

/**
 * .normalizeRotation
 *
 * returns a normalized rotation to +- Math.PI
 *
 * @param: {Number} radians, radians
 * @return: {Number} radians
 */
exports.normalizeRotation = function (radians) {
  radians = radians % (Math.PI * 2);
  if (radians < -Math.PI) {
    radians += Math.PI * 2;
  } else if (radians > Math.PI) {
    radians -= Math.PI * 2;
  };
  return radians;
};

/**
 * .euclideanDistance
 *
 * @todo: write docs
 */
exports.euclideanDistance = function (matrixA, matrixB) {
  return Math.sqrt(exports.euclideanDistanceSquared(matrixA, matrixB));
};

/**
 * .euclideanDistanceSquared
 *
 * @todo: write docs
 */
exports.euclideanDistanceSquared = function (matrixA, matrixB) {
  ops.sub(temp, matrixA, matrixB);
  ops.muleq(temp, temp);
  return ops.sum(temp);
};

/**
 * .rotateAroundPoint
 *
 * updates the target position by rotating x radians about origin position
 *
 * @param: {Vector2D} target
 * @param: {Vector2D} origin
 * @param: {Number} radians
 */
exports.rotateAroundPoint = function (target, origin, radians) {
  var difX = target.get(0) - origin.get(0),
      difY = target.get(1) - origin.get(1);

  target.set(0, Math.cos(radians) * difX - Math.sin(radians) * difY + origin.get(0));
  target.set(1, Math.sin(radians) * difX - Math.cos(radians) * difY + origin.get(1))

};

/**
 * .constrain
 *
 * restrains a node to its constrained rotation
 *
 * @param: {Node2D} target
 * @param: {Number} contrained rotation
 * @return: 
 */
exports.constrain = function (target, contraint) {
  
};
