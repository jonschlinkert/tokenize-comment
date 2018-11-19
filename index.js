'use strict';

const tokenize = require('./lib/tokenize');
const utils = require('./lib/utils');
const { define, typeOf } = utils;

module.exports = function(input, options = {}) {
  let state = { description: '', footer: '', examples: [], tags: [] };

  if (typeOf(input) === 'object' && input.raw) {
    state = { ...input, ...state };
    input = input.raw;
  }

  if (typeof input !== 'string') {
    throw new TypeError('expected input to be a string');
  }

  const str = options.stripStars !== false ? utils.stripStars(input) : input;
  const ast = tokenize(str, options, state);
  define(state, 'ast', ast);
  return state;
};
