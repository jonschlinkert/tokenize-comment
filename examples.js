var tokenize = require('./');
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
console.log(tok)
