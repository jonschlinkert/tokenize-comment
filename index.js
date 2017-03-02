'use strict';

var extend = require('extend-shallow');

module.exports = function tokenize(comment, options) {
  if (typeof comment !== 'string') {
    throw new TypeError('expected comment to be a string');
  }
  var str = stripStars(comment);
  return parseExamples(str, options);
};

function parseExamples(str, options) {
  var opts = extend({}, options);
  var segments = str.trim().split(/(?=\n\s*@(?!example))/);
  var exampleFn = opts.exampleFn || identity;
  var textFn = opts.textFn || identity;
  var str = segments.shift();
  var lines = str.split('\n');
  var stack = [];
  var example;
  var tok = {
    description: '',
    examples: [],
    tags: reduceTags(segments)
  };

  function parseLines(lines) {
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      let last = stack.length ? stack[stack.length - 1] : null;
      var match = /^(`{3,4})(.*)|( {4})(.*)|(@example)(.*)/.exec(line);

      if (match) {
        let isFenced = !!match[1];
        let isIndended = !!match[3];
        let isJavadoc = !!match[5];

        if (isFenced) {
          example = new Example('gfm', match[2]);
          while (lines[++i].trim() !== match[1]) {
            example.code += '\n' + lines[i];
          }

        } else if (isIndended) {
          example = new Example('indented');
          example.code += '\n' + match[4];
          let next = lines[++i];
          while (next && next.slice(0, 4) === '    ') {
            example.code += '\n' + next.slice(4);
            next = lines[++i];
          }

        } else if (isJavadoc) {
          example = new Example('jsdoc');
          example.code += match[6];
          let next = lines[++i];
          while (next && !/(?:\s*(?:@|`{3,4})| {4})/.test(next)) {
            example.code += '\n' + next;
            next = lines[++i];
          }
        }

        if (stack.length) {
          example.description = textFn(stack.pop());
        }

        tok.examples.push(exampleFn(example));

      } else {
        if (/^\s*@description/.test(line)) {
          var next = lines[i + 1];
          while (next.slice(0, 4) !== '    ' && /^[\w\s]+/.test(next) && !/\s*`{3,4}/.test(next)) {
            tok.description += '\n' + next;
            next = lines[++i];
          }
          continue;
        }

        if (line.trim() === '' && tok.description === '') {
          tok.description = textFn(stack.pop());
          continue;
        }

        if (!stack.length) {
          stack.push(line);
        } else {
          stack[stack.length - 1] += '\n' + line;
        }
      }
    }

    if (stack.length) {
      var val = textFn(stack.pop());
      if (/^@/.test(val)) {
        tok.tags.unshift(val);
      } else if (!tok.description) {
        tok.description = val;
      } else if (!tok.examples.length) {
        tok.description += '\n' + val;
      } else {
        tok.footer = val;
      }
    }
  }

  parseLines(lines);

  var tagsLen = tok.tags.length;
  if (!tok.description && tagsLen) {
    for (var i = 0; i < tagsLen; i++) {
      var tag = tok.tags[i];
      var match = /^@description\s*([\s\S]+)/.exec(tag);
      if (match) {
        tok.tags.splice(i, 1);
        // parseLines(match[1].split('\n'));
        tok.description = match[1];
      }
    }
  }

  // console.log(tok)
  return tok;
}

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
