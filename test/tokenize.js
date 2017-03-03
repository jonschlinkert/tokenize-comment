'use strict';

require('mocha');
var assert = require('assert');
var tokenize = require('..');

describe('tokenize', function() {
  describe('tokenize', function() {
    it('should tokenize a block comment', function() {
      var tok = tokenize('/* foo */');
      assert.deepEqual(tok, { description: 'foo', footer: '', examples: [], tags: [] });
    });

    it('should tokenize a comment with a multi-line description', function() {
      var tok = tokenize('/* foo\nbar\nbaz */');
      assert.deepEqual(tok, { description: 'foo\nbar\nbaz', footer: '', examples: [], tags: [] });
    });

    it('should strip extraneous indentation from comments', function() {
      var tok = tokenize([
        '/**',
        ' *      foo bar baz',
        ' *      ',
        ' *      ',
        ' *      @param {string} something',
        ' *      @param {string} else',
        ' */',
      ].join('\n'));

      assert.deepEqual(tok, {
        description: 'foo bar baz',
        footer: '',
        examples: [],
        tags: [
          {
            key: 'param',
            raw: '@param {string} something',
            type: 'tag',
            val: '{string} something'
          },
          {
            key: 'param',
            raw: '@param {string} else',
            type: 'tag',
            val: '{string} else'
          }
        ]
      });
    });
  });
});
