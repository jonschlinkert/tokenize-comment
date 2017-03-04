'use strict';

require('mocha');
var assert = require('assert');
var tokenize = require('..');

describe('indented', function() {
  it('should tokenize indented code examples', function() {
    var tok = tokenize([
      '/**',
      ' * Code:',
      ' *     @foo',
      ' *     @bar',
      ' *     @baz',
      ' */',
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'Code:',
      footer: '',
      examples: [{
        type: 'indented',
        val: '    @foo\n    @bar\n    @baz\n',
        description: '',
        language: '',
        code: '@foo\n@bar\n@baz\n'
      }],
      tags: []
    });
  });

  it('should work with extra indentation', function() {
    var tok = tokenize([
      '/**',
      ' *   Code:',
      ' *       @foo',
      ' *       @bar',
      ' *       @baz',
      ' */',
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'Code:',
      footer: '',
      examples: [{
        type: 'indented',
        val: '    @foo\n    @bar\n    @baz\n',
        description: '',
        language: '',
        code: '@foo\n@bar\n@baz\n'
      }],
      tags: []
    });
  });

  it('should work with comments not prefixed by stars', function() {
    var tok = tokenize([
      '',
      ' Code:',
      '     @foo',
      '     @bar',
      '     @baz',
      '',
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'Code:',
      footer: '',
      examples: [{
        type: 'indented',
        val: '    @foo\n    @bar\n    @baz\n',
        description: '',
        language: '',
        code: '@foo\n@bar\n@baz\n'
      }],
      tags: []
    });
  });

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
      footer: '',
      examples: [{
        type: 'indented',
        val: '    var foo = "bar";\n',
        description: '',
        language: '',
        code: 'var foo = "bar";\n'
      }],
      tags: [{
        type: 'tag',
        raw: '@param {string} something',
        key: 'param',
        val: '{string} something'
      }, {
        type: 'tag',
        raw: '@param {string} else',
        key: 'param',
        val: '{string} else'
      }]
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
      footer: '',
      examples: [{
        type: 'indented',
        val: '       var foo = "bar";\n       var baz = "qux";\n',
        description: '',
        language: '',
        code: '   var foo = "bar";\n   var baz = "qux";\n'
      }],
      tags: [{
          type: 'tag',
          raw: '@param {string} something',
          key: 'param',
          val: '{string} something'
        },
        {
          type: 'tag',
          raw: '@param {string} else',
          key: 'param',
          val: '{string} else'
        }
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
      footer: '',
      examples: [{
        type: 'indented',
        val: '    var foo = "bar";\n    var baz = "qux";\n',
        description: 'This is a description for an example.',
        language: '',
        code: 'var foo = "bar";\nvar baz = "qux";\n'
      }],
      tags: [{
        type: 'tag',
        raw: '@param {string} something',
        key: 'param',
        val: '{string} something'
      }, {
        type: 'tag',
        raw: '@param {string} else',
        key: 'param',
        val: '{string} else'
      }]
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
      footer: '',
      examples: [
         {
           code: 'var foo = "bar";\nvar baz = "qux";\n',
           description: 'This is a description for an example.',
           language: '',
           type: 'indented',
           val: '    var foo = \"bar\";\n    var baz = \"qux\";\n'
         }
      ],
      tags: [{
        type: 'tag',
        raw: '@param {string} something',
        key: 'param',
        val: '{string} something'
      }, {
        type: 'tag',
        raw: '@param {string} else',
        key: 'param',
        val: '{string} else'
      }]
    });
  });
});
