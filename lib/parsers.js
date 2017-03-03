'use strict';

module.exports = function(options, tok) {
  return function(parser) {
    var prevType = 'description';
    var examples = false;
    var footer = 0;
    var stack = [];
    var text = [];
    var tags = [];
    var prev = {};

    function update(node) {
      // console.log([tok.description]);
      console.log([node.type]);
      console.log([node.val]);
      console.log([prev.type]);
      console.log(text);
      console.log('----')

      if (node.type === 'description' && (text.length === 0 || prevType === 'break')) {
        text.push(node);

      } else if (node.type === 'description') {
        text[text.length - 1].val += node.val;

      } else if (text.length && (node.type === 'newline' || node.type === 'break')) {
        if (footer === 0 && text.length > 1 && examples === true) {
          tok.examples[tok.examples.length - 1].description += node.val;
        } else {
          text[text.length - 1].val += node.val;
        }

      } else if (!text.length) {
        tok.description += node.val;

      } else {
        if (text.length > 1 && examples) {
          node.description = text.pop().val;
        }
        footer = text.length;
      }
    }

    parser.on('node', function(node) {
      type = node.type;

      switch (type) {
        case 'gfm':
        case 'javadoc':
        case 'indented':
        case 'example':
          if (prev.type === 'tag') {
            prev.val += node.val;
            break;
          }

          examples = true;
          update(node);
          tok.examples.push(node);
          prev = node;
          stack.push(node);
          break;
        case 'tag':
          tok[type + 's'].push(node);
          prev = node;
          stack.push(node);
          break;
        case 'description':
          // if "node.key" exists it's a "@description"
          if (prev.type === 'tag' && !node.key) {
            prev.val += node.val;
            break;
          }

          update(node);
          prev = node;
          break;
        case 'newline':
        default: {
          if (prev.type === 'tag') {
            prev.val += node.val;
            break;
          }
          update(node);
          if (node.type === 'break') {
            prev = node;
          }
          break;
        }
      }
    });

    parser
      .set('break', function() {
        var pos = this.position();
        var match = this.match(/^\n{2,}/);
        if (match) {
          return this.node({
            type: 'break',
            val: match[0]
          });
        }
      })

      .set('newline', function() {
        var pos = this.position();
        var match = this.match(/^\n/);
        if (match) {
          return this.node({
            type: 'newline',
            val: match[0]
          });
        }
      })

      .set('tags', function() {
        var pos = this.position();
        var match = this.match(/^\s*@(?!example)(\S+) *([^\n]*)/);
        if (match) {
          var name = match[1] === 'description' ? match[1] : 'tag';
          return this.node({
            type: name,
            raw: match[0],
            key: match[1],
            val: match[2]
          });
        }
      })

      .set('gfm', function() {
        var pos = this.position();
        var match = this.match(/^( *)(`{3,4})(.*)/);
        if (match) {
          var node = this.node({
            type: 'gfm',
            val: match[0],
            description: '',
            language: match[3] || '',
            code: '',
          });

          var idx = this.input.indexOf('```');
          if (idx === -1) {
            throw new Error('missing closing "```"');
          }

          node.val += this.input.slice(0, idx + match[2].length);
          node.code += this.input.slice(0, idx);
          this.input = this.input.slice(idx + 3);

          if (match[1]) {
            var len = match[1].length;
            node.code = node.code.split('\n').map(function(ele) {
              return ele.slice(len);
            }).join('\n');
          }

          return node;
        }
      })

      .set('indented', function() {
        var pos = this.position();
        var match = this.match(/^ {4}([^\n]*\n?)/);
        if (match) {
          var node = this.node({
            type: 'indented',
            val: match[0],
            description: '',
            language: '',
            code: match[1],
          });

          var lines = this.input.split('\n');
          var i = 0;
          var line = lines[0];
          var len = 0;

          while (line && line.slice(0, 4) === '    ') {
            node.code += line.slice(4) + '\n';
            node.val += line + '\n';
            len += line.length + 1;
            line = lines[++i];
          }

          this.input = this.input.slice(len);
          return node;
        }
      })

      .set('javadoc', function() {
        var pos = this.position();
        var match = this.match(/^@example *([^\n]*\n?)/);
        if (match) {
          var node = this.node({
            type: 'javadoc',
            val: match[0],
            description: '',
            language: '',
            code: match[1],
          });

          var lines = this.input.split('\n');
          var i = 0;
          var line = lines[0];
          var len = 0;

          while (line && line.charAt(0) !== '@') {
            node.code += line + '\n';
            node.val += line + '\n';
            len += line.length + 1;
            line = lines[++i];
          }

          this.input = this.input.slice(len);
          return node;
        }
      })

      .set('description', function() {
        var pos = this.position();
        var match = this.match(/^ *(?!@|```| {4})[^\n]+/);
        if (match) {
          return this.node({
            type: 'description',
            val: match[0]
          });
        }
      })

      .set('eos', function() {
        if (footer && text.length > 1 && footer < text.length) {
          var len = text.length;
          var idx = footer;

          while (idx < len) {
            tok.footer += text[idx++].val;
          }

          text = text.slice(0, footer);
        }

        tok.description = (tok.description + text.map(function(node) {
          return node.val;
        }).join('')).trim();

        tok.footer = tok.footer.trim();

        tok.examples.forEach(function(example) {
          example.description = example.description.trim();
        });

        tok.tags.forEach(function(tag) {
          tag.raw = tag.raw.trim();
          tag.val = tag.val.trim();
        });
      });

  };
};

function stripIndent(str) {
  var match = /(?:^|\n)( *)\S/.exec(str);
  if (match) {
    var len = match[1].length;
    return str.replace(new RegExp(`(^|\\n) {${len}}`, 'g'), '$1');
  }
  return str;
}
