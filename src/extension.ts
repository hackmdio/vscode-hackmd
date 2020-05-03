// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import axios from 'axios';
import * as apiClient from '@hackmd/api';
import { MdTreeItemProvider } from './mdTreeView';
import { MdTextDocumentContentProvider } from './mdTextDocument';
import * as vscode from 'vscode';
import * as markdownitContainer from 'markdown-it-container';
import * as S from 'string';

import * as Prism from 'prismjs';

require('prismjs/components/prism-wiki');
require('prismjs/components/prism-haskell');
require('prismjs/components/prism-go');
require('prismjs/components/prism-typescript');
require('prismjs/components/prism-jsx');
require('prismjs/components/prism-makefile');
require('prismjs/components/prism-gherkin');
require('prismjs/components/prism-sas');
require('prismjs/components/prism-javascript');
require('prismjs/components/prism-json');
require('prismjs/components/prism-c');
require('prismjs/components/prism-cpp');
require('prismjs/components/prism-java');
require('prismjs/components/prism-csharp');
require('prismjs/components/prism-objectivec');
require('prismjs/components/prism-scala');
require('prismjs/components/prism-kotlin');
require('prismjs/components/prism-groovy');
require('prismjs/components/prism-r');
require('prismjs/components/prism-rust');
require('prismjs/components/prism-yaml');
require('prismjs/components/prism-pug');
require('prismjs/components/prism-sass');

import * as hljs from 'highlight.js/lib/highlight';

hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'));
hljs.registerLanguage('clojure', require('highlight.js/lib/languages/clojure'));
hljs.registerLanguage(
  'coffeescript',
  require('highlight.js/lib/languages/coffeescript'),
);
hljs.registerLanguage('cs', require('highlight.js/lib/languages/cs'));
hljs.registerLanguage('css', require('highlight.js/lib/languages/css'));
hljs.registerLanguage('elm', require('highlight.js/lib/languages/elm'));
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'));
hljs.registerLanguage(
  'handlebars',
  require('highlight.js/lib/languages/handlebars'),
);
hljs.registerLanguage('http', require('highlight.js/lib/languages/http'));
hljs.registerLanguage('ini', require('highlight.js/lib/languages/ini'));
hljs.registerLanguage('prolog', require('highlight.js/lib/languages/prolog'));
hljs.registerLanguage('python', require('highlight.js/lib/languages/python'));
hljs.registerLanguage('ruby', require('highlight.js/lib/languages/ruby'));
hljs.registerLanguage('sql', require('highlight.js/lib/languages/sql'));
hljs.registerLanguage('swift', require('highlight.js/lib/languages/swift'));
hljs.registerLanguage('diff', require('highlight.js/lib/languages/diff'));
hljs.registerLanguage('shell', require('highlight.js/lib/languages/shell'));
hljs.registerLanguage('php', require('highlight.js/lib/languages/php'));
hljs.registerLanguage('lua', require('highlight.js/lib/languages/lua'));
hljs.registerLanguage('nginx', require('highlight.js/lib/languages/nginx'));
hljs.registerLanguage('perl', require('highlight.js/lib/languages/perl'));
hljs.registerLanguage(
  'dockerfile',
  require('highlight.js/lib/languages/dockerfile'),
);


let prismLangs = [
  'haskell',
  'go',
  'groovy',
  'typescript',
  'json',
  'jsx',
  'gherkin',
  'sas',
  'javascript',
  'c',
  'cpp',
  'java',
  'csharp',
  'objectivec',
  'scala',
  'kotlin',
  'r',
  'rust',
  'yaml',
  'pug',
  'sass',
];

function render(tokens, idx, options, env, self): string {
  tokens[idx].attrJoin('role', 'alert');
  tokens[idx].attrJoin('class', 'alert');
  tokens[idx].attrJoin('class', `alert-${tokens[idx].info.trim()}`);
  return self.renderToken(...arguments);
}

function parseFenceCodeParams(lang) {
  const attrMatch = lang.match(/{(.*)}/);
  const params = {};
  if (attrMatch && attrMatch.length >= 2) {
    const attrs = attrMatch[1];
    const paraMatch = attrs.match(
      /([#.](\S+?)\s)|((\S+?)\s*=\s*("(.+?)"|'(.+?)'|\[[^\]]*\]|\{[}]*\}|(\S+)))/g,
    );

    if (paraMatch) {
      paraMatch.forEach(param => {
        param = param.trim();
        if (param[0] === '#') {
          params['id'] = param.slice(1);
        } else if (param[0] === '.') {
          if (params['class']) {
            params['class'] = [];
          }
          params['class'] = params['class'].concat(param.slice(1));
        } else {
          const offset = param.indexOf('=');
          const id = param
            .substring(0, offset)
            .trim()
            .toLowerCase();
          let val = param.substring(offset + 1).trim();
          const valStart = val[0];
          const valEnd = val[val.length - 1];
          if (
            ['"', "'"].indexOf(valStart) !== -1 &&
            ['"', "'"].indexOf(valEnd) !== -1 &&
            valStart === valEnd
          ) {
            val = val.substring(1, val.length - 1);
          }
          if (id === 'class') {
            if (params['class']) {
              params['class'] = [];
            }
            params['class'] = params['class'].concat(val);
          } else {
            params[id] = val;
          }
        }
      });
    }
  }
  return params;
}

function highlightRender(code, lang) {
  if (!lang || /no(-?)highlight|plain|text/.test(lang)) {
    // fallback
    return highlight(code, lang);
  }
  // support adding extra attributes for fence code block
  // ex: ```graphviz {engine="neato"}
  const params = parseFenceCodeParams(lang) as any;
  lang = lang.split(/\s+/g)[0];
  code = S(code).escapeHTML().s;
  if (lang === 'sequence') {
    return `<span class="sequence-diagram raw">${code}</span>`;
  } else if (lang === 'flow') {
    return `<span class="flow-chart raw">${code}</span>`;
  } else if (lang === 'graphviz') {
    // support to specify layout engine of graphviz
    let dataAttrs = '';
    if (params.hasOwnProperty('engine')) {
      dataAttrs = ' data-engine="' + params.engine + '"';
    }
    return `<span class="graphviz raw"${dataAttrs}>${code}</span>`;
  } else if (lang === 'mermaid') {
    return `<span class="mermaid raw">${code}</span>`;
  } else if (lang === 'abc') {
    return `<span class="abc raw">${code}</span>`;
  }

  const result = {
    value: code,
  };

  if (prismLangs.indexOf(lang) !== -1) {
    code = S(code).unescapeHTML().s;
    result.value = Prism.highlight(code, Prism.languages[lang]);
  } else if (lang === 'tiddlywiki' || lang === 'mediawiki') {
    code = S(code).unescapeHTML().s;
    result.value = Prism.highlight(code, Prism.languages.wiki);
  } else if (lang === 'cmake') {
    code = S(code).unescapeHTML().s;
    result.value = Prism.highlight(code, Prism.languages.makefile);
  } else {
    code = S(code).unescapeHTML().s;
    const languages = hljs.listLanguages();
    if (!languages.includes(lang)) {
      result.value = hljs.highlightAuto(code).value;
    } else {
      result.value = hljs.highlight(lang, code).value;
    }
  }

  const showlinenumbers = /=$|=\d+$|=\+$/.test(lang);
  if (showlinenumbers) {
    let startnumber = 1;
    const matches = lang.match(/=(\d+)$/);
    if (matches) {
      startnumber = parseInt(matches[1]);
    }
    const lines = result.value.split('\n');
    const linenumbers = [];
    for (let i = 0; i < lines.length - 1; i++) {
      linenumbers[i] = `<span data-linenumber='${startnumber + i}'></span>`;
    }
    const continuelinenumber = /=\+$/.test(lang);
    const linegutter = `<div class='gutter linenumber${
      continuelinenumber ? ' continue' : ''
      }'>${linenumbers.join('\n')}</div>`;
    result.value = `<div class='wrapper'>${linegutter}<div class='code'>${
      result.value
      }</div></div>`;
  }
  return result.value;
}

let highlight;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
const API = new apiClient.default();
axios.defaults.withCredentials = true;

const checkLogin = async () => {
  return await API.isLogin();
}

const login = async (context: vscode.ExtensionContext) => {
  const { email, password } = getLoginCredential(context);
  if (!email || !password) {
    vscode.window.showInformationMessage('Please enter email and password to use HackMD extension!')
    return;
  }
  await API.login(email, password);
  if (checkLogin) {
    vscode.window.showInformationMessage('Successfully login!')
  } else {
    vscode.window.showInformationMessage('Wrong email or password, please enter again')
  }
};

const getLoginCredential = (context: vscode.ExtensionContext) => {
  const email: string = context.globalState.get('email');
  const password: string = context.globalState.get('password');
  return { email, password };
};

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('extension.login', async () => {
    const email = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      password: false,
      placeHolder: 'email',
      prompt: 'Please enter your email account',
      validateInput: (text) => {
        if (text && text !== "") {
          return undefined;
        } else {
          return 'Email cannot be empty';
        }
      }
    });
    const password = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      password: true,
      placeHolder: 'password',
      prompt: 'Please enter your password',
      validateInput: (text) => {
        if (text && text !== "") {
          return undefined;
        } else {
          return 'password cannot be empty';
        }
      }
    });

    context.globalState.update('email', email);
    context.globalState.update('password', password);
    login(context);
  }));


  const history = (await API.getHistory()).history;
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('mdTreeItems', new MdTreeItemProvider(history))
  );

  context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('hackmd', new MdTextDocumentContentProvider()));

  context.subscriptions.push(vscode.commands.registerCommand('clickTreeItem', async (label, noteId) => {
    if (label && noteId) {
      const content = await API.exportString(noteId, apiClient.ExportType.MD);
      if (content) {
        const uri = vscode.Uri.parse(`hackmd:${label}.md#${noteId}`);
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc, { preview: false });
      }
    }
  }));

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

      md.use(
        require('markdown-it-mathjax')({
          beforeMath: '<span class="mathjax raw">',
          afterMath: '</span>',
          beforeInlineMath: '<span class="mathjax raw">',
          afterInlineMath: '</span>',
          beforeDisplayMath: '<span class="mathjax raw display">',
          afterDisplayMath: '</span>',
        }),
      );

      md.use(markdownitContainer, 'success', { render });
      md.use(markdownitContainer, 'info', { render });
      md.use(markdownitContainer, 'warning', { render });
      md.use(markdownitContainer, 'danger', { render });
      md.use(markdownitContainer, 'spoiler', {
        validate: function (params) {
          return params.trim().match(/^spoiler\s+(.*)$/);
        },
        render: function (tokens, idx) {
          var m = tokens[idx].info.trim().match(/^spoiler\s+(.*)$/);

          if (tokens[idx].nesting === 1) {
            // opening tag
            return (
              '<details><summary>' + md.utils.escapeHtml(m[1]) + '</summary>\n'
            );
          } else {
            // closing tag
            return '</details>\n';
          }
        },
      });

      md.options.linkify = true;
      md.options.typographer = true;
      highlight = md.options.highlight;
      md.options.highlight = highlightRender;

      return md;
    },
  };
}

// this method is called when your extension is deactivated
export function deactivate() { }