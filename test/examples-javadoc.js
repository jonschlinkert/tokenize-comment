'use strict';

require('mocha');
const assert = require('assert');
const tokenize = require('..');

describe('javadoc', function() {
  it('should tokenize javadoc code examples', function() {
    const tok = tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * @example',
      ' * var foo = "bar";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [{
        type: 'javadoc',
        language: '',
        description: '',
        raw: '@example\nvar foo = "bar";\n',
        value: '\nvar foo = "bar";\n'
      }],
      tags: [{
        type: 'tag',
        raw: '@param {string} something',
        key: 'param',
        value: '{string} something'
      }, {
        type: 'tag',
        raw: '@param {string} else',
        key: 'param',
        value: '{string} else'
      }]
    });
  });

  it('should tokenize javadoc example when it is the last tag', function() {
    const tok = tokenize([
      '/**',
      ' * foo bar baz',
      ' * @param {string} something',
      ' * @param {string} else',
      ' * ',
      ' * @example',
      ' * var foo = "bar";',
      ' *',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [{
        type: 'javadoc',
        language: '',
        description: '',
        raw: '@example\nvar foo = "bar";\n',
        value: '\nvar foo = "bar";\n'
      }],
      tags: [{
        type: 'tag',
        raw: '@param {string} something',
        key: 'param',
        value: '{string} something'
      }, {
        type: 'tag',
        raw: '@param {string} else',
        key: 'param',
        value: '{string} else'
      }]
    });
  });

  it('should tokenize multiple javadoc examples', function() {
    const tok = tokenize([
      '/**',
      ' * foo bar baz',
      ' * @param {string} something',
      ' * @param {string} else',
      ' * ',
      ' * @example',
      ' * var foo = "bar";',
      ' *   // inline comment',
      ' * var whatever = "something else";',
      ' * ',
      ' * @example',
      ' * var one = "two";',
      ' *',
      ' * ',
      ' * @example',
      ' * var abc = "xyz";',
      ' *',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [{
        type: 'javadoc',
        language: '',
        description: '',
        raw: '@example\nvar foo = \"bar\";\n  // inline comment\nvar whatever = \"something else\";\n',
        value: '\nvar foo = \"bar\";\n  // inline comment\nvar whatever = \"something else\";\n'
      },{
        type: 'javadoc',
        language: '',
        description: '',
        raw: '@example\nvar one = "two";\n',
        value: '\nvar one = "two";\n'
      },{
        type: 'javadoc',
        language: '',
        description: '',
        raw: '@example\nvar abc = "xyz";\n',
        value: '\nvar abc = "xyz";\n'
      }],
      tags: [{
        type: 'tag',
        raw: '@param {string} something',
        key: 'param',
        value: '{string} something'
      }, {
        type: 'tag',
        raw: '@param {string} else',
        key: 'param',
        value: '{string} else'
      }]
    });
  });

  it('should preserve indentation in javadoc code examples', function() {
    const tok = tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * @example',
      ' *    var foo = "bar";',
      ' *    var baz = "qux";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [{
        type: 'javadoc',
        language: '',
        description: '',
        raw: '@example\n   var foo = "bar";\n   var baz = "qux";\n',
        value: '\n   var foo = "bar";\n   var baz = "qux";\n'
      }],
      tags: [{
        type: 'tag',
        raw: '@param {string} something',
        key: 'param',
        value: '{string} something'
      }, {
        type: 'tag',
        raw: '@param {string} else',
        key: 'param',
        value: '{string} else'
      }]
    });
  });

  it('should detect a description for a javadoc code example', function() {
    const tok = tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * This is a description for an example.',
      ' * @example',
      ' * var foo = "bar";',
      ' * var baz = "qux";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [{
        type: 'javadoc',
        language: '',
        description: 'This is a description for an example.',
        raw: '@example\nvar foo = "bar";\nvar baz = "qux";\n',
        value: '\nvar foo = "bar";\nvar baz = "qux";\n'
      }],
      tags: [{
        type: 'tag',
        raw: '@param {string} something',
        key: 'param',
        value: '{string} something'
      }, {
        type: 'tag',
        raw: '@param {string} else',
        key: 'param',
        value: '{string} else'
      }]
    });
  });

  it('should detect a description & leading newline for a javadoc example', function() {
    const tok = tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * This is a description for an example.',
      ' *',
      ' * @example',
      ' * var foo = "bar";',
      ' * var baz = "qux";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [{
        type: 'javadoc',
        language: '',
        description: 'This is a description for an example.',
        raw: '@example\nvar foo = "bar";\nvar baz = "qux";\n',
        value: '\nvar foo = "bar";\nvar baz = "qux";\n'
      }],
      tags: [{
        type: 'tag',
        raw: '@param {string} something',
        key: 'param',
        value: '{string} something'
      }, {
        type: 'tag',
        raw: '@param {string} else',
        key: 'param',
        value: '{string} else'
      }]
    });
  });
});
