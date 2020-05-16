import * as vscode from 'vscode';
import { registerUserCommands } from './user'
import { registerTreeViewCommands } from './treeView'
import { Store } from '../store';

export function registerCommand(context: vscode.ExtensionContext, store: Store) {
    registerUserCommands(context, store);
    registerTreeViewCommands(context, store)
}