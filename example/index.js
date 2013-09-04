/*!
 * FABRIK example
 */

/**
 * Module dependencies.
 */

var http = require('http'),
    stack = require('stack'),
    ecstatic = require('ecstatic')({ 
      root: __dirname + '/public',
      gzip: true
    }),
    Browserify = require('browserify'),
    server,
    silent = 'test' === process.env.NODE_ENV;

/*!
 * browserify
 *
 * Browserify the client module and serve it.
 */
function browserify (req, res, next) {
  if (req.url === '/js/client.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.statusCode = 200;
    Browserify(__dirname + '/client.js')
      .bundle()
      .pipe(res);
  } else {
    next();
  };
};

// HTTP

server = http.createServer(
  stack(
    browserify,
    ecstatic
  )
);

server.listen(8080);
silent || console.log('Application started on port ' + 8080 + ' in ' + (process.env.NODE_ENV || 'development') + ' mode.');