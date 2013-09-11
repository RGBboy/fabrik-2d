/*!
 * fabrik-2d
 *
 * @note: This could be optimized by just comparing the Squared Euclidean 
 * distance instead of the actual distance, saving a `Math.sqrt` call;
 *
 * @todo: break up the equation so it can be tested easily.
 *
 * @todo: refactor repeating point to point rotation code.
 */

/**
 * Module dependencies.
 */

var util = require('./util'),
    ndarray = require('ndarray'),
    ops = require('ndarray-ops'),
    temp = ndarray(new Float32Array(2)),
    temp2 = ndarray(new Float32Array(2)),
    base = ndarray(new Float32Array(2)),
    oldFinalPosition = ndarray(new Float32Array(2));

/**
 * Module exports.
 */

exports = module.exports = function (nodes, target) {
  var i,
      r,
      delta,
      dif,
      baseRotation,
      relativeRotation,
      change = 1,
      tolerance = 0.1,
      iteration = 0,
      maxIterations = 50;

  // The target is reachable; thus set base as the initial position of 
  // the joint p[0] (the root position)
  ops.assign(base, nodes[0].position);
  baseRotation = nodes[0].rotation;
  // Check whether the distance between the end effector p[n] and the 
  // target position is greater than the tolerance.
  dif = util.euclideanDistanceSquared(nodes[nodes.length-1].position, target);
  ops.assign(oldFinalPosition, nodes[nodes.length-1].position);
  while (dif > tolerance && iteration < maxIterations && change > tolerance) {
    // Stage 1: Forward reaching
    // Set the end effector p[i] as target;
    ops.assign(nodes[nodes.length-1].position, target);
    // Set end effector rotation to point to p[i-1]
    ops.sub(temp, nodes[nodes.length-1].position, nodes[nodes.length-2].position);
    nodes[nodes.length-1].rotation = Math.atan2(temp.get(0), -temp.get(1));
    nodes[nodes.length-1].rotation = util.normalizeRotation(nodes[nodes.length-1].rotation);

    for (i = nodes.length - 2; i >= 0; i -= 1) {

      // calculate rotation between p[i] and p[i+1]
      ops.sub(temp, nodes[i+1].position, nodes[i].position);
      nodes[i].rotation = Math.atan2(temp.get(0), -temp.get(1));
      nodes[i].rotation = util.normalizeRotation(nodes[i].rotation);

      relativeRotation = util.normalizeRotation(nodes[i].rotation - nodes[i+1].rotation);

      // if node rotation is not within min and max range
      if (relativeRotation < nodes[i].minRotation ||
          relativeRotation > nodes[i].maxRotation) {

        // if minRotation is closest
        if (-2*relativeRotation - nodes[i].minRotation - nodes[i].maxRotation > 0) {
          nodes[i].position.set(0, nodes[i+1].position.get(0) + (nodes[i].length * Math.sin(nodes[i+1].rotation + nodes[i].minRotation)));
          nodes[i].position.set(1, nodes[i+1].position.get(1) + (nodes[i].length * Math.cos(nodes[i+1].rotation + nodes[i].minRotation)));
          nodes[i].rotation = nodes[i].rotation - relativeRotation - nodes[i].minRotation;
        } else {
          nodes[i].position.set(0, nodes[i+1].position.get(0) + (nodes[i].length * Math.sin(nodes[i+1].rotation + nodes[i].maxRotation)));
          nodes[i].position.set(1, nodes[i+1].position.get(1) + (nodes[i].length * Math.cos(nodes[i+1].rotation + nodes[i].maxRotation)));
          nodes[i].rotation = nodes[i].rotation - relativeRotation - nodes[i].maxRotation;
        };

      } else {
        // Find the distance r[i] between the new joint position p[i+1] 
        // and the joint p[i]
        r = util.euclideanDistance(nodes[i+1].position, nodes[i].position);
        delta = nodes[i].length / r;
        // Find the new joint positions p[i]
        // node[i].position = ((1 - delta) * node[i+1].position) + (delta * node[i].position);
        ops.muls(temp, nodes[i].position, delta);
        ops.muls(temp2, nodes[i+1].position, 1-delta);
        ops.add(nodes[i].position, temp, temp2);

        // calculate rotation between p[i] and p[i+1]
        ops.sub(temp, nodes[i].position, nodes[i+1].position);
        nodes[i].rotation = Math.atan2(temp.get(0), -temp.get(1));
        nodes[i].rotation = util.normalizeRotation(nodes[i].rotation);
      };

    };

    // Stage 2: Backward reaching
    // Set the root p[0] back to its original position and rotation;
    ops.assign(nodes[0].position, base);
    nodes[0].rotation = baseRotation;

    for (i = 0; i < nodes.length - 1; i += 1) {

      // calculate rotation between p[i] and p[i+1]
      ops.sub(temp, nodes[i].position, nodes[i+1].position);
      nodes[i].rotation = Math.atan2(temp.get(0), -temp.get(1));
      nodes[i].rotation = util.normalizeRotation(nodes[i].rotation);

      relativeRotation = nodes[i].localRotation();

      // if node rotation is not within min and max range
      if (relativeRotation < nodes[i].minRotation ||
          relativeRotation > nodes[i].maxRotation) {

        // if minRotation is closest
        // @note: we may need to normalize this calculation.
        if (-2*relativeRotation - nodes[i].minRotation - nodes[i].maxRotation > 0) {
          util.rotateAroundPoint(nodes[i+1].position, nodes[i].position, nodes[i].minRotation - relativeRotation);
        } else {
          util.rotateAroundPoint(nodes[i+1].position, nodes[i].position, nodes[i].maxRotation - relativeRotation);
        };

      };

      // Find the distance r[i] between the new joint position p[i] and 
      // the joint p[i+1]
      r = util.euclideanDistance(nodes[i+1].position, nodes[i].position);
      delta = nodes[i].length / r;
    
      // Find the new joint positions p[i]
      // node[i+1].position = ((1 - delta) * node[i].position) + (delta * node[i+1].position);
      ops.muls(temp, nodes[i+1].position, delta);
      ops.muls(temp2, nodes[i].position, 1-delta);
      ops.add(nodes[i+1].position, temp, temp2);

      // calculate rotation between p[i] and p[i+1]
      ops.sub(temp, nodes[i].position, nodes[i+1].position);
      nodes[i].rotation = Math.atan2(temp.get(0), -temp.get(1));
      nodes[i].rotation = util.normalizeRotation(nodes[i].rotation);

    };

    dif = util.euclideanDistanceSquared(nodes[nodes.length-1].position, target);
    //change = util.euclideanDistanceSquared(nodes[nodes.length-1].position, oldFinalPosition);
    ops.assign(oldFinalPosition, nodes[nodes.length-1].position);
    iteration += 1;
  };

  console.log('change: ', change);
  console.log('dif: ', dif);
  console.log('interation:', iteration);

};