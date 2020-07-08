import * as vscode from 'vscode';
import { registerSnippetCommands } from './snippet';
import { registerUserCommands } from './user';
import { registerTreeViewCommands } from './treeView';
import { registerNoteCommands } from './note';

export function registerCommands(context: vscode.ExtensionContext) {
    registerUserCommands(context);
    registerTreeViewCommands(context);
    registerNoteCommands(context);
    registerSnippetCommands(context);
}