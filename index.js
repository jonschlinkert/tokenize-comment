'use strict';

const typeOf = require('kind-of');
const define = require('define-property');
const Snapdragon = require('snapdragon');
const handlers = require('./lib/handlers');
const utils = require('./lib/utils');

module.exports = function(comment, options) {
  let res = {description: '', footer: '', examples: [], tags: []};

  if (typeOf(comment) === 'object' && comment.raw) {
    res = Object.assign({}, comment, res);
    comment = comment.raw;
  }

  if (typeof comment !== 'string') {
    throw new TypeError('expected comment to be a string');
  }

  const opts = Object.assign({}, options);
  const snapdragon = new Snapdragon(opts);
  snapdragon.parser.use(handlers(opts, res));

  const str = utils.stripStars(comment);
  const ast = snapdragon.parse(str);
  define(res, 'ast', ast);
  return res;
};
