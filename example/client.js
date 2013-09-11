/*!
 * Fabrik 2d client example
 *
 * If you try to move to a target that is exactly Math.PI radians from the 
 * current position and is within the bounds of the limb it will never 
 * reach a tolerable level.
 *
 */

/**
 * Module dependencies.
 */

var domready = require('domready'),
    Node2d = require('../lib/node-2d'),
    fabrik = require('../lib/fabrik-2d'),
    ndarray = require('ndarray'),
    canvas,
    context,
    nodes = [],
    target,
    step = 0;

domready(setup);

function setup () {
  var i;

  // Setup nodes
  nodes.push(new Node2d({ length: 50, x: 200, y: 200 }));
  for (i = 1; i <= 2; i += 1) {
    nodes.push(new Node2d({ length: 50 }));
    nodes[i-1].addChild(nodes[i]);
  };

  canvas = document.getElementById('canvas');
  canvas.addEventListener('click', handleClick, false);
  if (canvas.getContext) {
    context = canvas.getContext('2d');
    draw();
    //setInterval(animate, 50);
  };

};

function draw () {
  if (context) {
    context.clearRect(0,0,context.canvas.width, context.canvas.height);

    for (i = 0; i < nodes.length - 1; i += 1) {

      context.save();

      context.translate(nodes[i].position.get(0), nodes[i].position.get(1));

      context.save();

      if (nodes[i].parent) {
        context.rotate(nodes[i].parent.rotation);
      };

      context.strokeStyle = 'green';
      context.beginPath();
      context.arc(0, 0, 8, nodes[i].minRotation + Math.PI/2, nodes[i].maxRotation + Math.PI/2);
      context.stroke();

      context.restore();

      context.rotate(nodes[i].rotation);

      context.fillStyle = 'green';
      context.beginPath();
      context.arc(0, 0, 4, 0, 2 * Math.PI);
      context.fill();

      context.strokeStyle = 'red';
      context.beginPath();
      context.moveTo(0,0);
      context.lineTo(0, nodes[i].length);
      context.stroke();

      context.restore();

    };
  };
};

/*
function animate () {
  var steps = 20,
      delta;

  if (step < steps) {
    for (i = 0; i < nodes.length; i += 1) {
      delta = deltaRotation(nodes[i].targetRotation, nodes[i].rotation);
      delta = delta / (steps - step);
      nodes[i].rotation += delta;
      nodes[i].rotation = normalizeRotation(nodes[i].rotation);
    };
    step += 1;
    draw();
  }

};
*/

function handleClick (event) {
  var posX,
      posY,
      i;

  step = 0;

  if (event.offsetX) {
    posX = event.offsetX;
    posY = event.offsetY;
  } else {
    posX = event.pageX - event.target.offsetLeft;
    posX = event.pageY - event.target.offsetTop;
  };

  var target = ndarray(new Float32Array(2));
  target.set(0, posX);
  target.set(1, posY);

  fabrik(nodes, target);

  draw();

};