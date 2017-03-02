'use strict';

require('mocha');
var assert = require('assert');
var extract = require('extract-comments');
var support = require('./support');
var tokenize = require('..');

var fixtures = support.files(__dirname, 'fixtures');

describe('examples', function() {
  it.only('should tokenize gfm, indented or javadoc examples', function() {
    var tok = tokenize(fixtures['examples-multiple']);

    assert.deepEqual(tok, {
      description: 'This is a comment with\nseveral lines of text.',
      examples: [
        {
          type: 'gfm',
          language: 'js',
          description: 'An example\n',
          code: '\nvar foo = bar;\nvar foo = bar;\nvar foo = bar;'
        },
        {
          type: 'indented',
          language: '',
          description: '\nAnother example\n',
          code: '\nvar baz = fez;\nvar baz = fez;\nvar baz = fez;'
        },
        {
          type: 'indented',
          language: '',
          description: 'Another example\n',
          code: '\nvar baz = fez;\nvar baz = fez;'
        },
        {
          type: 'gfm',
          language: 'js',
          description: '\n\nAnd another example\n',
          code: '\nvar foo = bar;\nvar foo = bar;'
        },
        {
          type: 'jsdoc',
          language: '',
          description: '\nAnother example\n',
          code: '\nvar baz = fez;'
        },
        {
          type: 'jsdoc',
          language: '',
          description: '\nAnd another example\n',
          code: '\n// this is a comment\nvar alalla = zzzz;'
        },
        {
          type: 'indented',
          language: '',
          description: 'and another example\n',
          code: '\nvar baz = fez;\nvar baz = fez;'
        }
      ],
      footer: 'This is some random closing text.',
      tags: [
        {
          type: 'tag',
          raw: '@param {String} foo bar',
          key: 'param',
          val: '{String} foo bar'
        },
        {
          type: 'tag',
          raw: '@returns {Object} Instance of Foo',
          key: 'returns',
          val: '{Object} Instance of Foo'
        },
        {
          type: 'tag',
          raw: '@api public',
          key: 'api',
          val: 'public'
        }
      ]
    });
  });

  it('should work with arbitrary markdown', function() {
    var tok = tokenize(fixtures.markdown);

    assert.deepEqual(tok, {
      description: 'Set a parser that can later be used to parse any given string.',
      examples: [
        {
          type: 'gfm',
          language: 'js',
          description: '',
          code: '\n// foo.parser(name, replacements)\nfoo.parser(\"foo\", function (a, b, c) {\n    // body...\n})'
        }
      ],
      footer: '\n  This is arbitrary text.\n\n  * This is arbitrary text.\n  * This is arbitrary text.\n  * This is arbitrary text.\n\n**Example**\n\n{%= docs("example-parser.md") %}\n\nThis is a another description after the example.',
      tags: [
        '@param {String} `alpha`',
        '@param {Object|Array} `arr` Object or array of replacement patterns to associate.',
        '@property {String|RegExp} [arr] `pattern`',
        '@property {String|Function} [arr] `replacement`',
        '@param {String} `beta`',
        '@property {Array} [beta] `foo` This is foo option.',
        '@property {Array} [beta] `bar` This is bar option',
        '@return {Strings} to allow chaining',
        '@api public'
      ]
    });
  });

  // it.only('should tokenize gfm, indented or javadoc examples', function() {
  //   var comments = extract(fixtures.angular).filter(function(comment) {
  //     return comment.type === 'block' && comment.raw.charAt(0) === '*';
  //   }).slice(1);

  //   console.log(comments.slice(0, 5))
  //   // var tok = tokenize(comment);

  // });
});
