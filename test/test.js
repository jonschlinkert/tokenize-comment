'use strict';

require('mocha');
const assert = require('assert');
const tokenize = require('..');

describe('tokenize-comment', function() {
  describe('sound check', function() {
    it('should export a function', function() {
      assert.equal(typeof tokenize, 'function');
    });
  });

  describe('error handling', function() {
    it('should throw an error when invalid args are passed', function() {
      assert.throws(() => tokenize(), /expected input to be a string/);
    });
  });
});
