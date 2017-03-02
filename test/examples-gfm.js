'use strict';

require('mocha');
var assert = require('assert');
var support = require('./support');
var tokenize = require('..');

var fixtures = support.files(__dirname, 'fixtures');

describe('gfm', function() {
  it('should tokenize gfm code examples', function() {
    var tok = tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * ```js',
      ' * var foo = "bar";',
      ' * ```',
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
           language: 'js',
           type: 'gfm'
         }
      ],
      tags: [
        '@param {string} something',
        '@param {string} else'
      ]
    });
  });

  it('should preserve indentation in gfm code examples', function() {
    var tok = tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * ```js',
      ' *    var foo = "bar";',
      ' *    var baz = "qux";',
      ' * ```',
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
           language: 'js',
           type: 'gfm'
         }
      ],
      tags: [
        '@param {string} something',
        '@param {string} else'
      ]
    });
  });

  it('should detect a description for a gfm code example', function() {
    var tok = tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * This is a description for an example.',
      ' * ```js',
      ' * var foo = "bar";',
      ' * var baz = "qux";',
      ' * ```',
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
           language: 'js',
           type: 'gfm'
         }
      ],
      tags: [
        '@param {string} something',
        '@param {string} else'
      ]
    });
  });

  it('should detect a description & leading newline for a gfm example', function() {
    var tok = tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * This is a description for an example.',
      ' *',
      ' * ```js',
      ' * var foo = "bar";',
      ' * var baz = "qux";',
      ' * ```',
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
           language: 'js',
           type: 'gfm'
         }
      ],
      tags: [
        '@param {string} something',
        '@param {string} else'
      ]
    });
  });

  it.skip('should work when no stars prefix the gfm example', function () {
    var tok = tokenize(fixtures['examples-gfm-no-stars']);

    // assert.deepEqual(tok, {
    //   description: 'Invokes the `iterator` function once for each item in `obj` collection, which can be either an\n object or an array. The `iterator` function is invoked with `iterator(value, key, obj)`, where `value`\n is the value of an object property or an array element, `key` is the object property key or\n array element index and obj is the `obj` itself. Specifying a `context` for the function is optional.',
    //   examples: [
    //     {
    //       type: 'indented',
    //       language: '',
    //       description: ' It is worth noting that `.forEach` does not iterate over inherited properties because it filters\n using the `hasOwnProperty` method.\n\n Unlike ES262\'s\n [Array.prototype.forEach](http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.18),\n Providing \'undefined\' or \'null\' values for `obj` will not throw a TypeError, but rather just\n return the value provided.\n\n   ```js',
    //       code: '\n var values = {name: \'misko\', gender: \'male\'};\n var log = [];\n angular.forEach(values, function(value, key) {\n   this.push(key + \': \' + value);\n }, log);\n expect(log).toEqual([\'name: misko\', \'gender: male\']);'
    //     }
    //   ],
    //   tags: [
    //     '@ngdoc function',
    //     '@name angular.forEach',
    //     '@module ng',
    //     '@kind function',
    //     '@param {Object|Array} obj Object to iterate over.',
    //     '@param {Function} iterator Iterator function.',
    //     '@param {Object=} context Object to become context (`this`) for the iterator function.',
    //     '@returns {Object|Array} Reference to `obj`.'
    //   ]
    // });
  });
});
