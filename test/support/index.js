'use strict';

var fs = require('fs');
var path = require('path');
var stringify = require('stringify-object');
var extract = require('extract-comments');
var writeFile = require('write');
var tokenize = require('../..');

exports.files = function() {
  var cwd = path.resolve.apply(path, arguments);
  var files = fs.readdirSync(cwd);
  var res = {};

  for (var i = 0; i < files.length; i++) {
    var name = files[i];
    var fp = path.resolve(cwd, name);
    res[name.slice(0, -3)] = fs.readFileSync(fp, 'utf8');
  }
  return res;
};

exports.generate = function(name, dest) {
  var fixtures = exports.files(__dirname, '../fixtures');
  var comments = extract(fixtures[name]).filter(function(comment) {
    return comment.type === 'BlockComment';
  });

  var res = '';

  for (var i = 0; i < comments.length; i++) {
    var raw = '\n\n/*' + comments[i].raw + '*/\n';
    var tok = stringify(tokenize(raw), {indent: '  '});
    tok = tok.replace(/\s*Node\s*/g, '');
    res += raw;
    res += `\nassert.deepEqual(tokenize(comments[${i}].raw), ${tok});`;
  }

  writeFile.sync(dest, res.trim());
};
