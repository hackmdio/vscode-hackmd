import * as vscode from 'vscode';

import { registerNoteCommands } from './note';
import { registerSnippetCommands } from './snippet';
import { registerTreeViewCommands } from './treeView';

export function registerCommands(context: vscode.ExtensionContext) {
  registerTreeViewCommands(context);
  registerNoteCommands(context);
  registerSnippetCommands(context);
}
