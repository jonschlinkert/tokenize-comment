# tokenize-comment [![NPM version](https://img.shields.io/npm/v/tokenize-comment.svg?style=flat)](https://www.npmjs.com/package/tokenize-comment) [![NPM monthly downloads](https://img.shields.io/npm/dm/tokenize-comment.svg?style=flat)](https://npmjs.org/package/tokenize-comment)  [![NPM total downloads](https://img.shields.io/npm/dt/tokenize-comment.svg?style=flat)](https://npmjs.org/package/tokenize-comment) [![Linux Build Status](https://img.shields.io/travis/jonschlinkert/tokenize-comment.svg?style=flat&label=Travis)](https://travis-ci.org/jonschlinkert/tokenize-comment)

> Uses snapdragon to tokenize a single JavaScript block comment into an object, with description, tags, and code example sections that can be passed to any other comment parsers for further parsing.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save tokenize-comment
```

## Usage

The main export is a function that takes a string with a single javascript comment only, _no code_.

```js
var tokenize = require('tokenize-comment');
var token = tokenize(commentString);
console.log(token);
```

The comment can be a "raw" comment with leading stars:

```js
/**
 * foo bar baz
 * @param {String} abc Some description
 * @param {Object} def Another description
 */
```

Or a comment with stars already stripped (with or without leading whitespace):

```js
 foo bar baz
 @param {String} abc Some description
 @param {Object} def Another description
```

## Code examples

Recognizes gfm, javadoc and indented code examples. See [the unit tests](tests) for a number of more complex examples.

### GitHub Flavored Markdown

Supports [GFM style code examples](https://guides.github.com/features/mastering-markdown/#GitHub-flavored-markdown). The following comment:

```js
/**
 * foo bar baz
 * 
 * ```js
 * var foo = "bar";
 * ``` 
 * @param {string} something
 * @param {string} else
 */
```

Results in:

```js
{
  description: 'foo bar baz',
  footer: '',
  examples: [
    {
      type: 'gfm',
      val: '```js\nvar foo = "bar";\n```',
      description: '',
      language: 'js',
      code: '\nvar foo = "bar";\n'
    }
  ],
  tags: [
    {
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
}
```

### Indented code

Supports indented code examples:

```js
/**
 * foo bar baz
 * 
 *     var foo = "bar";
 *
 * @param {string} something
 * @param {string} else
 */
```

### javadoc (jsdoc)

Supports [javadoc-style](https://en.wikipedia.org/wiki/Javadoc) code examples:

```js
/**
 * foo bar baz
 * 
 * @example
 * var foo = "bar";
 * var baz = "qux";
 *
 * @param {string} something
 * @param {string} else
 */
```

Results in:

```js
{
  description: 'foo bar baz',
  footer: '',
  examples: [
    {
      type: 'javadoc',
      language: '',
      description: '',
      raw: '@example\nvar foo = "bar";\nvar baz = "qux";\n',
      val: '\nvar foo = "bar";\nvar baz = "qux";\n'
    }
  ],
  tags: [
    {
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
}
```

## Mixture

It will also recognize a mixture of formats (javadoc-style examples must always be last):

```js
/**
 * This is a comment with
 * several lines of text.
 *
 * An example
 *
 * ```js
 * var foo = bar;
 * var foo = bar;
 * var foo = bar;
 * ```

* * Another example
* * ```var baz = fez;
```* ```var baz = fez;
```* ```var baz = fez;
```* * Another example
* * ```var baz = fez;
```* ```var baz = fez;
```* * * * And another example
* * 
```js

```
* var foo = bar;
* var foo = bar;
* 
```

```
* * Another example
* * @example
* var baz = fez;
* * @example
* // this is a comment
* var alalla = zzzz;
* * @param {String} foo bar
* @returns {Object} Instance of Foo
* @api public
*/
```

Results in:

```js
{
  description: 'This is a comment with\nseveral lines of text.',
  footer: '',
  examples: [
    {
      type: 'gfm',
      language: 'js',
      description: 'An example',
      raw: '```js\nvar foo = bar;\nvar foo = bar;\nvar foo = bar;\n```',
      val: '\nvar foo = bar;\nvar foo = bar;\nvar foo = bar;\n'
    }, 
    {
      type: 'indented',
      language: '',
      description: 'Another example',
      raw: '    var baz = fez;\n    var baz = fez;\n    var baz = fez;\n',
      val: 'var baz = fez;\nvar baz = fez;\nvar baz = fez;\n'
    }, 
    {
      type: 'indented',
      language: '',
      description: 'Another example',
      raw: '    var baz = fez;\n    var baz = fez;\n',
      val: 'var baz = fez;\nvar baz = fez;\n'
    }, 
    {
      type: 'gfm',
      language: 'js',
      description: 'And another example',
      raw: '```js\nvar foo = bar;\nvar foo = bar;\n```',
      val: '\nvar foo = bar;\nvar foo = bar;\n'
    }, 
    {
      type: 'javadoc',
      language: '',
      description: 'Another example',
      raw: '@example\nvar baz = fez;\n',
      val: '\nvar baz = fez;\n'
    }, 
    {
      type: 'javadoc',
      language: '',
      description: '',
      raw: '@example\n// this is a comment\nvar alalla = zzzz;\n',
      val: '\n// this is a comment\nvar alalla = zzzz;\n'
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
}
```

## About

### Related projects

* [parse-comments](https://www.npmjs.com/package/parse-comments): Parse code comments from JavaScript or any language that uses the same format. | [homepage](https://github.com/jonschlinkert/parse-comments "Parse code comments from JavaScript or any language that uses the same format.")
* [snapdragon](https://www.npmjs.com/package/snapdragon): Easy-to-use plugin system for creating powerful, fast and versatile parsers and compilers, with built-in source-map… [more](https://github.com/jonschlinkert/snapdragon) | [homepage](https://github.com/jonschlinkert/snapdragon "Easy-to-use plugin system for creating powerful, fast and versatile parsers and compilers, with built-in source-map support.")
* [strip-comments](https://www.npmjs.com/package/strip-comments): Strip comments from code. Removes line comments, block comments, the first comment only, or all… [more](https://github.com/jonschlinkert/strip-comments) | [homepage](https://github.com/jonschlinkert/strip-comments "Strip comments from code. Removes line comments, block comments, the first comment only, or all comments. Optionally leave protected comments unharmed.")

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

Please read the [contributing guide](.github/contributing.md) for advice on opening issues, pull requests, and coding standards.

### Building docs

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

### Running tests

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

### Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](https://twitter.com/jonschlinkert)

### License

Copyright © 2017, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.4.3, on March 10, 2017._