'use strict';

exports.stripStars = function(str) {
  // [^\S\r\n\u2028\u2029]
  const res = str.replace(/\t/g, '  ')
    .replace(/^\s*\/\*+[^\S\n]*/, '')
    .replace(/[^\S\n]*\*\/\s*$/, '')
    .replace(/^[^\S\n]*\*/gm, '')
    .replace(/^[^\S\n]{1,3}@(?=\S)/gm, '@')
    .replace(/\s+$/, '');

  return exports.trimRight(exports.stripIndent(res));
};

exports.stripIndent = function(str) {
  let match = /(?:^|\n)([^\S\n]*)\S/.exec(str);
  if (match) {
    let len = match[1].length;
    return str.replace(new RegExp(`(^|\\n) {${len}}`, 'g'), '$1');
  }
  return str;
};

exports.trimRight = function(str) {
  return str.replace(/\s+$/, '');
};

/**
 * Return the native type of a value
 */

const typeOf = exports.typeOf = val => {
  if (typeof val === 'string') return 'string';
  if (Array.isArray(val)) return 'array';
  if (val instanceof RegExp) {
    return 'regexp';
  }
  if (val && typeof val === 'object') {
    return 'object';
  }
};

/**
 * Define a non-enumerable property on an object
 */

exports.define = (obj, key, value) => {
  Reflect.defineProperty(obj, key, {
    enumerable: false,
    configurable: true,
    writable: true,
    value
  });
};
