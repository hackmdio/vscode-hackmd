// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as markdownitContainer from 'markdown-it-container';

function render( tokens, idx, options, env, self): string {
  tokens[idx].attrJoin('role', 'alert');
  tokens[idx].attrJoin('class', 'alert');
  tokens[idx].attrJoin('class', `alert-${tokens[idx].info.trim()}`);
  return self.renderToken(...arguments);
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

      return md;
    }
  };
}

// this method is called when your extension is deactivated
export function deactivate() {}
