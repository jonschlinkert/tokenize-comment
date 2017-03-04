'use strict';

require('mocha');
var assert = require('assert');
var extract = require('extract-comments');
var support = require('./support');
var tokenize = require('..');

var fixtures = support.files(__dirname, 'fixtures');

describe('examples', function() {
  // it.only('should tokenize gfm, indented or javadoc examples', function() {
  //   var comments = extract(fixtures.angular).filter(function(comment) {
  //     return comment.type === 'block' && comment.raw.charAt(0) === '*';
  //   }).slice(1);

  //   console.log(comments.slice(0, 5))
  //   // var tok = tokenize(comment);

  // });

  it('should tokenize gfm, indented or javadoc examples', function () {
    var tok = tokenize(fixtures['examples-multiple']);

    assert.deepEqual(tok, {
      description: 'This is a comment with\nseveral lines of text.',
      footer: '',
      examples: [
        {
          type: 'gfm',
          val: '```js\nvar foo = bar;\nvar foo = bar;\nvar foo = bar;\n```',
          description: 'An example',
          language: 'js',
          code: '\nvar foo = bar;\nvar foo = bar;\nvar foo = bar;\n'
        },
        {
          type: 'indented',
          val: '    var baz = fez;\n    var baz = fez;\n    var baz = fez;\n',
          description: 'Another example',
          language: '',
          code: 'var baz = fez;\nvar baz = fez;\nvar baz = fez;\n'
        },
        {
          type: 'indented',
          val: '    var baz = fez;\n    var baz = fez;\n',
          description: 'Another example',
          language: '',
          code: 'var baz = fez;\nvar baz = fez;\n'
        },
        {
          type: 'gfm',
          val: '```js\nvar foo = bar;\nvar foo = bar;\n```',
          description: 'And another example',
          language: 'js',
          code: '\nvar foo = bar;\nvar foo = bar;\n'
        },
        {
          type: 'javadoc',
          val: '@example\nvar baz = fez;\n',
          description: 'Another example',
          language: '',
          code: '\nvar baz = fez;\n'
        },
        {
          type: 'javadoc',
          val: '@example\n// this is a comment\nvar alalla = zzzz;\n',
          description: '',
          language: '',
          code: '\n// this is a comment\nvar alalla = zzzz;\n'
        }
      ],
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

  it('should work with arbitrary markdown', function () {
    var tok = tokenize(fixtures.markdown);

    assert.deepEqual(tok, {
      description: 'Set a parser that can later be used to parse any given string.',
      footer: 'This is arbitrary text.\n\n  * This is arbitrary text.\n  * This is arbitrary text.\n  * This is arbitrary text.\n\n**Example**\n\n{%= docs("example-parser.md") %}\n\nThis is a another description after the example.',
      examples: [{
        type: 'gfm',
        val: '```js\n// foo.parser(name, replacements)\nfoo.parser("foo", function (a, b, c) {\n    // body...\n})\n```',
        description: '',
        language: 'js',
        code: '\n// foo.parser(name, replacements)\nfoo.parser("foo", function (a, b, c) {\n    // body...\n})\n'
      }],
      tags: [{
        type: 'tag',
        raw: '@param {String} `alpha`',
        key: 'param',
        val: '{String} `alpha`'
      }, {
        type: 'tag',
        raw: '@param {Object|Array} `arr` Object or array of replacement patterns to associate.',
        key: 'param',
        val: '{Object|Array} `arr` Object or array of replacement patterns to associate.'
      }, {
        type: 'tag',
        raw: '@property {String|RegExp} [arr] `pattern`',
        key: 'property',
        val: '{String|RegExp} [arr] `pattern`'
      }, {
        type: 'tag',
        raw: '@property {String|Function} [arr] `replacement`',
        key: 'property',
        val: '{String|Function} [arr] `replacement`'
      }, {
        type: 'tag',
        raw: '@param {String} `beta`',
        key: 'param',
        val: '{String} `beta`'
      }, {
        type: 'tag',
        raw: '@property {Array} [beta] `foo` This is foo option.',
        key: 'property',
        val: '{Array} [beta] `foo` This is foo option.'
      }, {
        type: 'tag',
        raw: '@property {Array} [beta] `bar` This is bar option',
        key: 'property',
        val: '{Array} [beta] `bar` This is bar option'
      }, {
        type: 'tag',
        raw: '@return {Strings} to allow chaining',
        key: 'return',
        val: '{Strings} to allow chaining'
      }, {
        type: 'tag',
        raw: '@api public',
        key: 'api',
        val: 'public'
      }]
    });
  });
});
