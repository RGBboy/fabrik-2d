/*!
 * fabrik-2d
 *
 * @note: This could be optimized by just comparing the Squared Euclidean 
 * distance instead of the actual distance, saving a `Math.sqrt` call;
 *
 * @todo: break up the equation so it can be tested easily.
 */

/**
 * Module dependencies.
 */

var util = require('./util'),
    ndarray = require('ndarray'),
    ops = require('ndarray-ops'),
    temp = ndarray(new Float32Array(2)),
    temp2 = ndarray(new Float32Array(2)),
    base = ndarray(new Float32Array(2));

/**
 * Module exports.
 */

exports = module.exports = function (nodes, target) {
  var i,
      distance,
      reach,
      r,
      delta,
      dif,
      tolerance = 1,
      iteration = 0,
      maxIterations = 25;
  // The distance between root and target
  distance = util.euclideanDistance(nodes[0].position, target);
  // Calculate reach of limb
  reach = 0;
  for (i = 0; i < nodes.length - 1; i += 1) {
    reach += nodes[i].length;
  };
  // @todo: Remove this check so that rotation constraints take effect.
  // Check if target is within reach
  if (distance > reach) {
    // The target is unreachable
    for (i = 0; i < nodes.length - 1; i += 1) {
      // Find the distance r[i] between the target position and the joint 
      // position p[i]
      r = util.euclideanDistance(target, nodes[i].position);
      delta = nodes[i].length / r;
      // Find the new joint position p[i]
      // node[i+1].position = ((1 - delta) * node[i].position) + (delta * t);
      ops.muls(temp, target, delta);
      ops.muls(temp2, nodes[i].position, 1-delta);
      ops.add(nodes[i+1].position, temp, temp2);
    };
  } else {
    // The target is reachable; thus set base as the initial position of 
    // the joint p[0] (the root position)
    ops.assign(base, nodes[0].position);
    // Check whether the distance between the end effector p[n] and the 
    // target position is greater than the tolerance.
    dif = util.euclideanDistance(nodes[nodes.length-1].position, target);
    while (dif > tolerance && iteration < maxIterations) {
      // Stage 1: Forward reaching
      // Set the end effector p[i] as target;
      ops.assign(nodes[nodes.length-1].position, target);
      // @todo: set the end effector rotation
      
      for (i = nodes.length - 2; i >= 0; i -= 1) {
        // @todo: Add rotational constraint code here

        // Find the distance r[i] between the new joint position p[i+1] 
        // and the joint p[i]
        r = util.euclideanDistance(nodes[i+1].position, nodes[i].position);
        delta = nodes[i].length / r;
        // Find the new joint positions p[i]
        // node[i].position = ((1 - delta) * node[i+1].position) + (delta * node[i].position);
        ops.muls(temp, nodes[i].position, delta);
        ops.muls(temp2, nodes[i+1].position, 1-delta);
        ops.add(nodes[i].position, temp, temp2);
      };
      // Stage 2: Backward reaching
      // Set the root p[0] back to its original position;
      ops.assign(nodes[0].position, base);
      // @todo: set the root p[0] rotation to original rotation;

      for (i = 0; i < nodes.length - 1; i += 1) {
        // @todo: Add rotational constraint code here

        // Find the distance r[i] between the new joint position p[i] and 
        // the joint p[i+1]
        r = util.euclideanDistance(nodes[i+1].position, nodes[i].position);
        delta = nodes[i].length / r;
        
        // Find the new joint positions p[i]
        // node[i+1].position = ((1 - delta) * node[i].position) + (delta * node[i+1].position);
        ops.muls(temp, nodes[i+1].position, delta);
        ops.muls(temp2, nodes[i].position, 1-delta);
        ops.add(nodes[i+1].position, temp, temp2);
      };
      dif = util.euclideanDistance(nodes[nodes.length-1].position, target);
      iteration += 1;
    };
  };
};