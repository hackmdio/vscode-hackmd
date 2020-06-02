import * as vscode from 'vscode';
import * as apiClient from '@hackmd/api';
const API = new apiClient.default();

export function registerSnippetCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('HackMD.createCodeSnippet', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor.selection.isEmpty) {
            vscode.window.showInformationMessage('The code block is empty. Please select a range of text first.');
            return;
        }
        const textRange = new vscode.Range(editor.selection.start.line, editor.selection.start.character, editor.selection.end.line, editor.selection.end.character);
        const text = vscode.window.activeTextEditor.document.getText(textRange);
        const snippet = `> \`${vscode.workspace.asRelativePath(editor.document.uri.fsPath)}\`\n\n\`\`\`${editor.document.languageId}=${editor.selection.start.line + 1}\n${text}\n\`\`\``;
        
        await API.newNote(snippet);
    }));
}