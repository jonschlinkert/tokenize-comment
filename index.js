'use strict';

var extend = require('extend-shallow');
var Snapdragon = require('snapdragon');
var parsers = require('./lib/parsers');

module.exports = function tokenize(comment, options) {
  if (typeof comment !== 'string') {
    throw new TypeError('expected comment to be a string');
  }
  var str = stripStars(comment);
  var opts = extend({}, options);
  var snapdragon = new Snapdragon();

  var token = {description: '', footer: '', examples: [], tags: []};
  snapdragon.parser.use(parsers(opts, token));

  var ast = snapdragon.parse(str);
  // console.log(token)
  return token;
};

function Example(type, lang) {
  this.type = type;
  this.language = lang ? lang.trim() : '';
  this.description = '';
  this.code = '';
}

function stripStars(str) {
  str = str.replace(/\t/g, '  ');
  str = str.replace(/^[ \n]*\/\*+ */, '');
  str = str.replace(/ *\*\/[ \n]*$/, '');
  str = str.replace(/^ *\*/gm, '');
  str = str.replace(/^ *@(?=[^\s])/gm, '@');
  str = stripIndent(str);
  return trimRight(str);
}

function reduceTags(tags) {
  var arr = [];
  for (var i = 0; i < tags.length; i++) {
    var line = tags[i].trim();
    if (line) {
      arr.push(line);
    }
  }
  return arr;
}

function stripIndent(str) {
  var match = /(?:^|\n)( *)\S/.exec(str);
  if (match) {
    var len = match[1].length;
    return str.replace(new RegExp(`(^|\\n) {${len}}`, 'g'), '$1');
  }
  return str;
}

function trimRight(str) {
  return str.replace(/\s+$/, '');
}

function identity(str) {
  return str;
}
