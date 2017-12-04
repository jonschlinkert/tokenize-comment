'use strict';

var typeOf = require('kind-of');
var Snapdragon = require('snapdragon');
var define = require('define-property');
var handlers = require('./lib/handlers');
var utils = require('./lib/utils');

module.exports = function(comment, options) {
  var res = {description: '', footer: '', examples: [], tags: []};

  if (typeOf(comment) === 'object' && comment.raw) {
    res = Object.assign({}, comment, res);
    comment = comment.raw;
  }

  if (typeof comment !== 'string') {
    throw new TypeError('expected comment to be a string');
  }

  var opts = Object.assign({}, options);
  var snapdragon = new Snapdragon(opts);
  snapdragon.parser.use(handlers(opts, res));

  var str = utils.stripStars(comment);
  var ast = snapdragon.parse(str);
  define(res, 'ast', ast);
  return res;
};
