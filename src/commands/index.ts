import * as vscode from 'vscode';
import { registerUserCommands } from './user'
import { registerTreeViewCommands } from './treeView'
import { registerNoteCommands } from './note';
import { registerSnippetCommands } from './snippet'
import { Store } from '../store';

export function registerCommand(context: vscode.ExtensionContext, store: Store) {
    registerUserCommands(context, store);
    registerTreeViewCommands(context, store);
    registerNoteCommands(context);
    registerSnippetCommands(context);
}