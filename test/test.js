'use strict';

require('mocha');
var assert = require('assert');
var tokenize = require('..');

describe('tokenize-comment', function() {
  describe('sound check', function() {
    it('should export a function', function() {
      assert.equal(typeof tokenize, 'function');
    });
  });

  describe('error handling', function() {
    it('should throw an error when invalid args are passed', function(cb) {
      try {
        tokenize();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'expected comment to be a string');
        cb();
      }
    });
  });
});
