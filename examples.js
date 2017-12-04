var extract = require('extract-comments');
var tokenize = require('./');
var comments = extract([
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
  '',
  'function foo() {}',
  '',
].join('\n'));

var tok = tokenize(comments[0]);
console.log(tok)
