/*!
 * FABRIK client example
 */

/**
 * Module dependencies.
 */

var domready = require('domready'),
    canvas,
    context;

domready(function () {
  canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    context = canvas.getContext('2d');
    context.beginPath();
    context.moveTo(240,100);
    context.lineTo(240,200);
    context.stroke();
  };
});

/**
 * Module exports.
 */