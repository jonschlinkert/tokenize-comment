'use strict';

const define = require('define-property');

module.exports = function(options, tok) {
  return function(parser) {
    let stack = [];
    let type = 'description';
    let footer = 0;
    let prev = parser.ast;
    let prevType;

    function last(arr) {
      return arr[arr.length - 1];
    }

    function append(prop, str) {
      last(stack)[prop] += str;
    }

    function update(node) {
      if (type === 'description') {
        if (stack.length === 0 || prevType === 'break' || prev.isExample === true) {
          stack.push(node);
        } else {
          append('val', node.val);
        }

      } else if (type === 'example' && prev.type === 'description' && stack.length > 1) {
        node.description += stack.pop().val;
        footer = stack.length;

      } else if (stack.length && (type === 'newline' || type === 'break')) {
        if (prev.isExample === true) {
          prev.description += node.val;
        } else {
          append('val', node.val);
        }

      } else if (!stack.length && !node.isExample) {
        tok.description += node.val;

      } else {
        footer = stack.length;
      }
    }

    parser.on('node', function(node) {
      type = node.type;

      switch (type) {
        case 'gfm':
        case 'javadoc':
        case 'indented':
        case 'example':
          define(node, 'isExample', true);
          if (prev.type === 'tag' && type === 'indented') {
            prev.val += node.val;
            prev.raw += node.val;
            break;
          }

          type = 'example';
          update(node);
          tok.examples.push(node);
          prev = node;
          break;

        case 'tag':
          tok[type + 's'].push(node);
          prev = node;
          break;

        // if "node.key" exists it's a "@description"
        case 'description':
          if (prev.type === 'tag' && !node.key) {
            prev.val += node.val;
            prev.raw += node.val;
            break;
          }
          update(node);
          prev = node;
          break;

        case 'newline':
        default: {
          if (prev.type === 'tag') {
            prev.val += node.val;
            prev.raw += node.val;
            break;
          }
          update(node);
          break;
        }
      }
      prevType = type;
    });

    parser
      .set('break', function() {
        const pos = this.position();
        const match = this.match(/^\n{2,}/);
        if (match) {
          return pos(this.node({
            type: 'break',
            val: match[0]
          }));
        }
      })

      .set('newline', function() {
        const pos = this.position();
        const match = this.match(/^\n/);
        if (match) {
          return pos(this.node({
            type: 'newline',
            val: match[0]
          }));
        }
      })

      .set('gfm', function() {
        const pos = this.position();
        const match = this.match(/^([^\S\n]{0,3})(`{3,4}|~{3,4})(.*)/);
        if (match) {
          const node = pos(this.node({
            type: 'gfm',
            raw: match[0],
            description: '',
            language: match[3] || '',
            val: ''
          }));

          const fenceLen = match[2].length;
          const fence = fenceLen === 3 ? '```' : '````';
          let idx = this.input.indexOf(fence);

          while (this.input[idx - 1] === '\\') {
            idx = this.input.indexOf(fence, idx + 1);
          }

          if (idx === -1) {
            throw new Error('missing closing "' + fence + '"');
          }

          node.raw += this.input.slice(0, idx + fenceLen);
          node.val += this.input.slice(0, idx);
          this.input = this.input.slice(idx + fenceLen);

          if (match[1]) {
            const len = match[1].length;
            const segs = node.val.split('\n');
            node.val = segs.map(ele => ele.slice(len)).join('\n');
          }
          return node;
        }
      })

      .set('indented', function() {
        const pos = this.position();
        const match = this.match(/^ {4}([^\n]*\n?)/);
        if (match) {
          const node = pos(this.node({
            type: 'indented',
            language: '',
            description: '',
            raw: match[0],
            val: match[1]
          }));

          const lines = this.input.split('\n');
          let line = lines[0];
          let len = 0;
          let i = 0;

          while (isString(line) && (line.slice(0, 4) === '    ' || line === '')) {
            node.val += line.slice(4) + '\n';
            node.raw += line + '\n';
            len += line.length + 1;
            line = lines[++i];
          }

          node.val = node.val.replace(/\n+$/, '\n');
          node.raw = node.raw.replace(/\n+$/, '\n');

          this.input = this.input.slice(len);
          return node;
        }
      })

      .set('javadoc', function() {
        const pos = this.position();
        const match = this.match(/^@example *([^\n]*\n?)/);
        if (match) {
          const node = pos(this.node({
            type: 'javadoc',
            language: '',
            description: '',
            raw: match[0],
            val: match[1]
          }));

          const lines = this.input.split('\n');
          let line = lines[0];
          let len = 0;
          let i = 0;

          while (isString(line) && (!/^\s*(@|`{3,4}|~{3,4})/.test(line) || line === '')) {
            node.val += line + '\n';
            node.raw += line + '\n';
            len += line.length + 1;
            line = lines[++i];
          }

          node.val = node.val.replace(/\n+$/, '\n');
          node.raw = node.raw.replace(/\n+$/, '\n');
          this.input = this.input.slice(len);
          return node;
        }
      })

      .set('tags', function() {
        const pos = this.position();
        const match = this.match(/^ {0,3}@(?!example)(\S+) *([^\n]*)/);
        if (match) {
          const name = match[1] === 'description' ? match[1] : 'tag';
          return pos(this.node({
            type: name,
            raw: match[0],
            key: match[1],
            val: match[2]
          }));
        }
      })

      .set('description', function() {
        const pos = this.position();
        const match = this.match(/^ {0,3}(?!@|`{3,4}|~{3,4}| {4})[^\n]*/);
        if (match) {
          return pos(this.node({type: 'description', val: match[0]}));
        }
      })

      .set('eos', function() {
        if (footer && stack.length > 1 && footer < stack.length) {
          stack.slice(footer).forEach(function(node) {
            tok.footer += node.val;
          });
          stack = stack.slice(0, footer);
        }

        stack.forEach(function(node) {
          tok.description += node.val;
        });

        tok.description = tok.description.trim();
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

function isString(val) {
  return typeof val === 'string';
}
