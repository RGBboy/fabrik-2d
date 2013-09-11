/*!
 * node-2d
 *
 * @todo: change position to be a Vector2D or similar.
 * @todo: allow setting of initial rotation
 * @todo: allow changing of minRotation and maxRotation
 */

/**
 * Module dependencies.
 */

var util = require('../lib/util'),
    ndarray = require('ndarray'),
    ops = require('ndarray-ops'),
    temp = ndarray(new Float32Array(2));

/**
 * Node2D
 *
 * @param: {Object} options
 * @return: {Object} Node2D instance
 */
function Node2d (options) {

  var self = {};

  self.length = options.length || 1;

  self.rotation = 0; // absolute rotation

  self.minRotation = -Math.PI/2; // -90
  self.maxRotation = Math.PI/2; // +90

  // absolute position
  self.position = ndarray(new Float32Array(2));
  self.position.set(0, options.x || 0);
  self.position.set(1, options.y || 0);

  self.addChild = function (child) {
    self.child = child;
    child.parent = self;
    child.position.set(0, self.position.get(0));
    child.position.set(1, self.position.get(1) + self.length);
  };

  self.localRotation = function () {
    var radians;
    radians = self.rotation;
    if (self.parent) {
      radians -= self.parent.rotation;
      radians = util.normalizeRotation(radians);
    };
    return radians;
  };

  return self;

};

/**
 * Module exports.
 */

exports = module.exports = Node2d;