'use strict';

var Snapdragon = require('snapdragon');
var extend = require('extend-shallow');
var define = require('define-property');
var middleware = require('./lib/middleware');
var utils = require('./lib/utils');

module.exports = function tokenize(comment, options) {
  if (typeof comment !== 'string') {
    throw new TypeError('expected comment to be a string');
  }

  var str = utils.stripStars(comment);
  var opts = extend({}, options);
  var snapdragon = new Snapdragon(opts);

  var token = {description: '', footer: '', examples: [], tags: []};
  snapdragon.parser.use(middleware(opts, token));

  define(token, 'ast', snapdragon.parse(str));
  return token;
};

