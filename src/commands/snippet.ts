import * as vscode from 'vscode';

export function registerSnippetCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('HackMD.createCodeSnippet', () => {
        console.log('test');
    }));
}