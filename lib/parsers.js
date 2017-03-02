'use strict';

module.exports = function(options, tok) {
  return function(parser) {
    var type = 'description';
    var stack = [];
    var tags = [];
    var prev = {};

    function update(node) {
      // console.log(node)
      if (node.type === 'description' && (!prev || prev.type !== 'tag')) {
        tok.description +=  node.val;

      } else if (prev.type === 'description' || !stack.length) {
        tok.description +=  node.val;

      } else if (prev.type === 'description' && !tok.description.trim()) {
        tok.description +=  node.val;

      } else if (stack.length) {
        stack[stack.length - 1].val += node.val;
      }
    }

    parser.on('node', function(node) {
      type = node.type;

      switch (type) {
        case 'gfm':
        case 'javadoc':
        case 'indented':
        case 'example':
          tok.examples.push(node);
          stack.push(node);
          prev.type = type;
          break;
        case 'tag':
          tok[type + 's'].push(node);
          stack.push(node);
          prev.type = type;
          break;
        case 'description':
          update(node);
          prev.type = type;
          break;
        case 'newline':
        default: {
          update(node);
          break;
        }
      }

      prev = node;
    });

    parser
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
        var match = this.match(/^\s*@(\S+) *([^\n]*)/);
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
        var match = this.match(/^(`{3,4})(.*)/);
        if (match) {
          var val = match[0];

          var last = stack[stack.length - 1];
          if (last && last.type === 'gfm') {
            last.code += val;
            last.val += val;
            stack.pop();
            return;
          }

          return this.node({
            type: 'gfm',
            val: val,
            description: '',
            open: match[1],
            language: match[2] || '',
            code: '',
          });
        }
      })

      .set('indented', function() {
        var pos = this.position();
        var match = this.match(/^ {4}(.*)/);
        if (match) {
          var val = match[0];

          var last = stack[stack.length - 1];
          if (last && last.type === 'indented') {
            last.code += val;
            last.val += val;
            stack.pop();
            return;
          }

          return this.node({
            type: 'indented',
            val: val,
            description: '',
            code: match[1],
            language: ''
          });
        }
      })

      .set('javadoc', function() {
        var pos = this.position();
        var match = this.match(/^@example(.*)/);
        if (match) {
          var val = match[0];

          var last = stack[stack.length - 1];
          if (last && last.type === 'javadoc') {
            last.code += val;
            last.val += val;
            stack.pop();
            return;
          }

          return this.node({
            type: 'javadoc',
            val: val,
            description: '',
            code: match[1],
            language: ''
          });
        }
      })

      // .set('examples', function() {
      //   var pos = this.position();
      //   var match = this.match(/^(`{3,4})(.*)|( {4})(.*)|(@example)(.*)/);
      //   if (match) {
      //     var lines = this.input.split('\n');
      //     var val = match[0];
      //     var i = 0;
      //     var next = lines[i + 1];

      //     while (next && next.trim() !== match[1]) {
      //       val += '\n' + lines[++i];
      //       next = lines[i];
      //     }

      //     return this.node({
      //       type: 'examples',
      //       lang: match[2] || '',
      //       val: val,
      //       code: val
      //     });
      //   }
      // })

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
        tok.description = tok.description.trim();
        tok.tags.forEach(function(tag) {
          tag.raw = tag.raw.trim();
          tag.val = tag.val.trim();
        });
        // console.log(tok);
      })

  };
};
