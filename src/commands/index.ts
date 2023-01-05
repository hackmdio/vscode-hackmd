import * as vscode from 'vscode';

import { registerNoteCommands } from './note';
import { registerSnippetCommands } from './snippet';
import { registerTreeViewCommands } from './treeView';
import { registerUserCommands } from './user';

export function registerCommands(context: vscode.ExtensionContext) {
  registerUserCommands(context);
  registerTreeViewCommands(context);
  registerNoteCommands(context);
  registerSnippetCommands(context);
}
