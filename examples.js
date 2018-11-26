const extract = require('extract-comments');
const tokenize = require('./');
const comments = extract([
  '/**',
  ' * foo bar baz',
  ' * ',
  ' * ```js',
  ' * const foo = "bar";',
  ' * ```',
  ' *',
  ' * @param {string} something',
  ' * @param {string} else',
  ' */',
  '',
  'function foo() {}',
  '',
].join('\n'));

const tok = tokenize(comments[0]);
console.log(tok);
