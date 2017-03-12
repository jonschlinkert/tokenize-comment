'use strict';

exports.stripStars = function(str) {
  str = str.replace(/\t/g, '  ');
  str = str.replace(/^\s*\/\*+ */, '');
  str = str.replace(/ *\*\/\s*$/, '');
  str = str.replace(/^ *\*/gm, '');
  str = str.replace(/^ {1,3}@(?=\S)/gm, '@');
  str = exports.stripIndent(str);
  return exports.trimRight(str);
};

exports.stripIndent = function(str) {
  var match = /(?:^|\n)([^\S\n]*)\S/.exec(str);
  if (match) {
    var len = match[1].length;
    return str.replace(new RegExp(`(^|\\n) {${len}}`, 'g'), '$1');
  }
  return str;
};

exports.trimRight = function(str) {
  return str.replace(/\s+$/, '');
};
