'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var extract = require('extract-comments');
var support = require('./support');
var tokenize = require('..');

var fixtures = support.files(__dirname, 'fixtures');

describe('multi-line tags', function() {
  it('should tokenize multi-line tags', function() {
    var comments = extract(fixtures['multiline']).filter(function(comment) {
      return comment.type === 'block';
    });

    // support.generate('multiline', 'multiline-units.js');

    /**
     * only
     *
     * @sample
     * one
     * two
     * three
     */

    assert.deepEqual(tokenize(comments[0].raw), {
      description: 'only',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@sample\none\ntwo\nthree',
          key: 'sample',
          val: 'one\ntwo\nthree'
        }
      ]
    });

    /**
     * first
     *
     * @sample
     * one
     * two
     * three
     * @bar last
     */

    assert.deepEqual(tokenize(comments[1].raw), {
      description: 'first',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@sample\none\ntwo\nthree',
          key: 'sample',
          val: 'one\ntwo\nthree'
        },
        {
          type: 'tag',
          raw: '@bar last',
          key: 'bar',
          val: 'last'
        }
      ]
    });

    /**
     * last
     *
     * @foo first
     * @sample
     * one
     * two
     * three
     */

    assert.deepEqual(tokenize(comments[2].raw), {
      description: 'last',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@foo first',
          key: 'foo',
          val: 'first'
        },
        {
          type: 'tag',
          raw: '@sample\none\ntwo\nthree',
          key: 'sample',
          val: 'one\ntwo\nthree'
        }
      ]
    });

    /**
     * mid
     *
     * @foo first
     * @sample
     * one
     * two
     * three
     * @bar last
     */

    assert.deepEqual(tokenize(comments[3].raw), {
      description: 'mid',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@foo first',
          key: 'foo',
          val: 'first'
        },
        {
          type: 'tag',
          raw: '@sample\none\ntwo\nthree',
          key: 'sample',
          val: 'one\ntwo\nthree'
        },
        {
          type: 'tag',
          raw: '@bar last',
          key: 'bar',
          val: 'last'
        }
      ]
    });

    /**
     * only
     *
     * @param {String} foo
     * one
     * two
     * three
     */

    assert.deepEqual(tokenize(comments[4].raw), {
      description: 'only',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@param {String} foo\none\ntwo\nthree',
          key: 'param',
          val: '{String} foo\none\ntwo\nthree'
        }
      ]
    });

    /**
     * first
     *
     * @param {String} foo
     * one
     * two
     * three
     * @bar last
     */

    assert.deepEqual(tokenize(comments[5].raw), {
      description: 'first',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@param {String} foo\none\ntwo\nthree',
          key: 'param',
          val: '{String} foo\none\ntwo\nthree'
        },
        {
          type: 'tag',
          raw: '@bar last',
          key: 'bar',
          val: 'last'
        }
      ]
    });

    /**
     * last
     *
     * @foo first
     * @param {String} foo
     * one
     * two
     * three
     */

    assert.deepEqual(tokenize(comments[6].raw), {
      description: 'last',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@foo first',
          key: 'foo',
          val: 'first'
        },
        {
          type: 'tag',
          raw: '@param {String} foo\none\ntwo\nthree',
          key: 'param',
          val: '{String} foo\none\ntwo\nthree'
        }
      ]
    });

    /**
     * mid
     *
     * @foo first
     * @param {String} foo
     * one
     * two
     * three
     * @bar last
     */

    assert.deepEqual(tokenize(comments[7].raw), {
      description: 'mid',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@foo first',
          key: 'foo',
          val: 'first'
        },
        {
          type: 'tag',
          raw: '@param {String} foo\none\ntwo\nthree',
          key: 'param',
          val: '{String} foo\none\ntwo\nthree'
        },
        {
          type: 'tag',
          raw: '@bar last',
          key: 'bar',
          val: 'last'
        }
      ]
    });

    /**
     * only
     *
     * @return {String}
     * one
     * two
     * three
     */

    assert.deepEqual(tokenize(comments[8].raw), {
      description: 'only',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@return {String}\none\ntwo\nthree',
          key: 'return',
          val: '{String}\none\ntwo\nthree'
        }
      ]
    });

    /**
     * first
     *
     * @return {String}
     * one
     * two
     * three
     * @bar last
     */

    assert.deepEqual(tokenize(comments[9].raw), {
      description: 'first',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@return {String}\none\ntwo\nthree',
          key: 'return',
          val: '{String}\none\ntwo\nthree'
        },
        {
          type: 'tag',
          raw: '@bar last',
          key: 'bar',
          val: 'last'
        }
      ]
    });

    /**
     * last
     *
     * @foo first
     * @return {String}
     * one
     * two
     * three
     */

    assert.deepEqual(tokenize(comments[10].raw), {
      description: 'last',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@foo first',
          key: 'foo',
          val: 'first'
        },
        {
          type: 'tag',
          raw: '@return {String}\none\ntwo\nthree',
          key: 'return',
          val: '{String}\none\ntwo\nthree'
        }
      ]
    });

    /**
     * mid
     *
     * @foo first
     * @return {String}
     * one
     * two
     * three
     * @bar last
     */

    assert.deepEqual(tokenize(comments[11].raw), {
      description: 'mid',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@foo first',
          key: 'foo',
          val: 'first'
        },
        {
          type: 'tag',
          raw: '@return {String}\none\ntwo\nthree',
          key: 'return',
          val: '{String}\none\ntwo\nthree'
        },
        {
          type: 'tag',
          raw: '@bar last',
          key: 'bar',
          val: 'last'
        }
      ]
    });

    /**
     * example
     *
     * @example
     *     test(one);
     *     test(two);
     */

    assert.deepEqual(tokenize(comments[12].raw), {
      description: 'example',
      footer: '',
      examples: [
        {
          type: 'javadoc',
          language: '',
          description: '',
          raw: '@example\n    test(one);\n    test(two);\n',
          val: '\n    test(one);\n    test(two);\n'
        }
      ],
      tags: []
    });

    /**
     * @tag-1 foo
     * @tag-2 bar
     *
     * @tag-3 baz
     */

    assert.deepEqual(tokenize(comments[13].raw), {
      description: '',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@tag-1 foo',
          key: 'tag-1',
          val: 'foo'
        },
        {
          type: 'tag',
          raw: '@tag-2 bar',
          key: 'tag-2',
          val: 'bar'
        },
        {
          type: 'tag',
          raw: '@tag-3 baz',
          key: 'tag-3',
          val: 'baz'
        }
      ]
    });

    /**
      * @tag-1
      * foo
      * @tag-2
      * bar
      *
      * @tag-3
      * baz
      */

    assert.deepEqual(tokenize(comments[14].raw), {
      description: '',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@tag-1\n foo',
          key: 'tag-1',
          val: 'foo'
        },
        {
          type: 'tag',
          raw: '@tag-2\n bar',
          key: 'tag-2',
          val: 'bar'
        },
        {
          type: 'tag',
          raw: '@tag-3\n baz',
          key: 'tag-3',
          val: 'baz'
        }
      ]
    });
  });
});
