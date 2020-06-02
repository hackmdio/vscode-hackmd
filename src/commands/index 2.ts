import { registerSnippetCommands } from './snippet';
import * as vscode from 'vscode';

export function registerCommand(context: vscode.ExtensionContext) {
    registerSnippetCommands(context);
}