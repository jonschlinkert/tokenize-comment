'use strict';

require('mocha');
var assert = require('assert');
var tokenize = require('..');

describe('indented', function() {
  it('should tokenize indented code examples', function() {
    var tok = tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' *     var foo = "bar";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */',
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      examples: [
         {
           code: '\nvar foo = "bar";',
           description: '',
           language: '',
           type: 'indented'
         }
      ],
      tags: [
        '@param {string} something',
        '@param {string} else'
      ]
    });
  });

  it('should preserve indentation in indented code examples', function() {
    var tok = tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' *        var foo = "bar";',
      ' *        var baz = "qux";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */',
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      examples: [
         {
           code: '\n   var foo = "bar";\n   var baz = "qux";',
           description: '',
           language: '',
           type: 'indented'
         }
      ],
      tags: [
        '@param {string} something',
        '@param {string} else'
      ]
    });
  });

  it('should detect a description for a indented code example', function() {
    var tok = tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * This is a description for an example.',
      ' *     var foo = "bar";',
      ' *     var baz = "qux";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */',
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      examples: [
         {
           code: '\nvar foo = "bar";\nvar baz = "qux";',
           description: 'This is a description for an example.',
           language: '',
           type: 'indented'
         }
      ],
      tags: [
        '@param {string} something',
        '@param {string} else'
      ]
    });
  });

  it('should detect a description & leading newline for a indented example', function() {
    var tok = tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * This is a description for an example.',
      ' *',
      ' *     var foo = "bar";',
      ' *     var baz = "qux";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */',
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      examples: [
         {
           code: '\nvar foo = "bar";\nvar baz = "qux";',
           description: 'This is a description for an example.\n',
           language: '',
           type: 'indented'
         }
      ],
      tags: [
        '@param {string} something',
        '@param {string} else'
      ]
    });
  });
});
