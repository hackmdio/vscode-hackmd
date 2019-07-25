// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as markdownitContainer from 'markdown-it-container';
import * as S from 'string';

function render( tokens, idx, options, env, self): string {
  tokens[idx].attrJoin('role', 'alert');
  tokens[idx].attrJoin('class', 'alert');
  tokens[idx].attrJoin('class', `alert-${tokens[idx].info.trim()}`);
  return self.renderToken(...arguments);
}

function parseFenceCodeParams (lang) {
  const attrMatch = lang.match(/{(.*)}/)
  const params = {}
  if (attrMatch && attrMatch.length >= 2) {
    const attrs = attrMatch[1]
    const paraMatch = attrs.match(/([#.](\S+?)\s)|((\S+?)\s*=\s*("(.+?)"|'(.+?)'|\[[^\]]*\]|\{[}]*\}|(\S+)))/g)
    paraMatch && paraMatch.forEach(param => {
      param = param.trim()
      if (param[0] === '#') {
        params['id'] = param.slice(1)
      } else if (param[0] === '.') {
        if (params['class']) params['class'] = []
        params['class'] = params['class'].concat(param.slice(1))
      } else {
        const offset = param.indexOf('=')
        const id = param.substring(0, offset).trim().toLowerCase()
        let val = param.substring(offset + 1).trim()
        const valStart = val[0]
        const valEnd = val[val.length - 1]
        if (['"', "'"].indexOf(valStart) !== -1 && ['"', "'"].indexOf(valEnd) !== -1 && valStart === valEnd) {
          val = val.substring(1, val.length - 1)
        }
        if (id === 'class') {
          if (params['class']) params['class'] = []
          params['class'] = params['class'].concat(val)
        } else {
          params[id] = val
        }
      }
    })
  }
  return params
}

function highlightRender (code, lang) {
  if (!lang || /no(-?)highlight|plain|text/.test(lang)) { return }
  // support adding extra attributes for fence code block
  // ex: ```graphviz {engine="neato"}
  const params = parseFenceCodeParams(lang) as any;
  lang = lang.split(/\s+/g)[0]
  code = S(code).escapeHTML().s
  if (lang === 'sequence') {
    return `<span class="sequence-diagram raw">${code}</span>`
  } else if (lang === 'flow') {
    return `<span class="flow-chart raw">${code}</span>`
  } else if (lang === 'graphviz') {
    // support to specify layout engine of graphviz
    let dataAttrs = ''
    if (params.hasOwnProperty('engine')) {
      dataAttrs = ' data-engine="' + params.engine + '"'
    }
    return `<span class="graphviz raw"${dataAttrs}>${code}</span>`
  } else if (lang === 'mermaid') {
    return `<span class="mermaid raw">${code}</span>`
  } else if (lang === 'abc') {
    return `<span class="abc raw">${code}</span>`
  }
  const result = {
    value: code
  }
  const showlinenumbers = /=$|=\d+$|=\+$/.test(lang)
  if (showlinenumbers) {
    let startnumber = 1
    const matches = lang.match(/=(\d+)$/)
    if (matches) { startnumber = parseInt(matches[1]) }
    const lines = result.value.split('\n')
    const linenumbers = []
    for (let i = 0; i < lines.length - 1; i++) {
      linenumbers[i] = `<span data-linenumber='${startnumber + i}'></span>`
    }
    const continuelinenumber = /=\+$/.test(lang)
    const linegutter = `<div class='gutter linenumber${continuelinenumber ? ' continue' : ''}'>${linenumbers.join('\n')}</div>`
    result.value = `<div class='wrapper'>${linegutter}<div class='code'>${result.value}</div></div>`
  }
  return result.value
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  return {
    extendMarkdownIt(md: any) {
      md.use(require('markdown-it-abbr'));
      md.use(require('markdown-it-deflist'));
      md.use(require('markdown-it-mark'));
      md.use(require('markdown-it-ins'));
      md.use(require('markdown-it-sub'));
      md.use(require('markdown-it-sup'));

      md.use(require('markdown-it-table-of-contents'), {
        markerPattern: /^\[toc\]/im,
      });

      md.use(require('markdown-it-mathjax')({
        beforeMath: '<span class="mathjax raw">',
        afterMath: '</span>',
        beforeInlineMath: '<span class="mathjax raw">\\(',
        afterInlineMath: '\\)</span>',
        beforeDisplayMath: '<span class="mathjax raw">\\[',
        afterDisplayMath: '\\]</span>'
      }));

      md.use(markdownitContainer, 'success', { render });
      md.use(markdownitContainer, 'info', { render });
      md.use(markdownitContainer, 'warning', { render });
      md.use(markdownitContainer, 'danger', { render });

      md.options.linkify = true;
      md.options.typographer = true;
      md.options.highlight = highlightRender;

      return md;
    }
  };
}

// this method is called when your extension is deactivated
export function deactivate() {}
