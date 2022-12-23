'use strict';

const isString = val => typeof val === 'string';
const Lexer = require('snapdragon-lexer');
const { define } = require('./utils');

module.exports = function(str, options, state) {
  const lexer = new Lexer(options);
  lexer.ast = { type: 'root', nodes: [] };
  let stack = [];
  let type = 'description';
  let prev = lexer.ast;
  let footer = 0;
  let prevType;

  function last(arr) {
    return arr[arr.length - 1];
  }

  function append(prop, str) {
    last(stack)[prop] += str;
  }

  function update(token) {
    if (type === 'description') {
      if (stack.length === 0 || prevType === 'break' || prev.isExample === true) {
        stack.push(token);
      } else {
        append('value', token.value);
      }

    } else if (type === 'example' && prev.type === 'description' && stack.length > 1) {
      token.description += stack.pop().value;
      footer = stack.length;

    } else if (stack.length && (type === 'newline' || type === 'break')) {
      if (prev.isExample === true) {
        prev.description += token.value;
      } else {
        append('value', token.value);
      }

    } else if (!stack.length && !token.isExample) {
      state.description += token.value;

    } else {
      footer = stack.length;
    }
  }

  lexer.on('token', function(token) {
    type = token.type;

    switch (type) {
      case 'gfm':
      case 'javadoc':
      case 'indented':
      case 'example':
        define(token, 'isExample', true);
        if (prev.type === 'tag' && type === 'indented') {
          prev.value += token.value;
          prev.raw += token.value;
          break;
        }

        type = 'example';
        update(token);
        state.examples.push(token);
        prev = token;
        break;

      case 'tag':
        state[type + 's'].push(token);
        prev = token;
        break;

      case 'description':
        // if "token.key" exists, it's a "@description" tag
        if (prev.type === 'tag' && !token.key) {
          prev.value += token.value;
          prev.raw += token.value;
          break;
        }
        update(token);
        prev = token;
        break;

      case 'newline':
      default: {
        if (prev.type === 'tag') {
          prev.value += token.value;
          prev.raw += token.value;
          break;
        }
        update(token);
        break;
      }
    }
    prevType = type;
  });

  lexer
    .capture('break', /^\n{2,}/)
    .capture('newline', /^\n/)
    .set('gfm', function() {
      const loc = this.location();
      const match = this.match(/^([^\S\n]{0,3})(`{3,4}|~{3,4})(.*)/);
      if (match) {
        const token = loc(this.token({
          type: 'gfm',
          raw: match[0],
          description: '',
          language: match[3] || '',
          value: ''
        }));

        let fenceLen = match[2].length;
        let fence = fenceLen === 3 ? '```' : '````';
        let idx = this.state.string.indexOf(fence);

        while (this.state.string[idx - 1] === '\\') {
          idx = this.state.string.indexOf(fence, idx + 1);
        }

        if (idx === -1) {
          throw new Error('missing closing "' + fence + '"');
        }

        token.raw += this.state.string.slice(0, idx + fenceLen);
        token.value += this.state.string.slice(0, idx);
        this.state.string = this.state.string.slice(idx + fenceLen);

        if (match[1]) {
          let len = match[1].length;
          let segs = token.value.split('\n');
          token.value = segs.map(ele => ele.slice(len)).join('\n');
        }
        return token;
      }
    })
    .set('indented', function() {
      let loc = this.location();
      let match = this.match(/^ {4}([^\n]*\n?)/);
      if (match) {
        let token = loc(this.token({
          type: 'indented',
          language: '',
          description: '',
          raw: match[0],
          value: match[1]
        }));

        let lines = this.state.string.split('\n');
        let line = lines[0];
        let len = 0;
        let i = 0;

        while (isString(line) && (line.slice(0, 4) === '    ' || line === '')) {
          token.value += line.slice(4) + '\n';
          token.raw += line + '\n';
          len += line.length + 1;
          line = lines[++i];
        }

        token.value = token.value.replace(/\n+$/, '\n');
        token.raw = token.raw.replace(/\n+$/, '\n');

        this.state.string = this.state.string.slice(len);
        return token;
      }
    })
    .set('javadoc', function() {
      let loc = this.location();
      let match = this.match(/^@example *([^\n]*\n?)/);
      if (match) {
        let token = loc(this.token({
          type: 'javadoc',
          language: '',
          description: '',
          raw: match[0],
          value: match[1]
        }));

        let lines = this.state.string.split('\n');
        let line = lines[0];
        let len = 0;
        let i = 0;

        while (isString(line) && (!/^\s*(@|`{3,4}|~{3,4})/.test(line) || line === '')) {
          token.value += line + '\n';
          token.raw += line + '\n';
          len += line.length + 1;
          line = lines[++i];
        }

        token.value = token.value.replace(/\n+$/, '\n');
        token.raw = token.raw.replace(/\n+$/, '\n');
        this.state.string = this.state.string.slice(len);
        return token;
      }
    })
    .set('tags', function() {
      let loc = this.location();
      let match = this.match(/^ {0,3}@(?!example)(\S+) *([^\n]*)/);
      if (match) {
        let name = match[1] === 'description' ? match[1] : 'tag';
        return loc(this.token({
          type: name,
          raw: match[0],
          key: match[1],
          value: match[2]
        }));
      }
    })

    .capture('description', /^[^\S\n]{0,3}(?!@(\S+)|`{3,4}|~{3,4}| {4})[^\n]*/)

  /**
   * Lex the string
   */

  let tokens = lexer.lex(str);

  if (footer && stack.length > 1 && footer < stack.length) {
    stack.slice(footer).forEach(token => (state.footer += token.value));
    stack = stack.slice(0, footer);
  }

  stack.forEach(token => (state.description += token.value));
  state.description = state.description.trim();
  state.footer = state.footer.trim();

  state.examples.forEach(function(example) {
    example.description = example.description.trim();
  });

  state.tags.forEach(function(tag) {
    tag.raw = tag.raw.trim();
    tag.value = tag.value.trim();
  });
  return tokens;
};

