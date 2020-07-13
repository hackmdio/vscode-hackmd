import * as vscode from 'vscode';
import { API } from './../api';
import { checkLogin } from './../utils';

export function registerSnippetCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('HackMD.createCodeSnippet', async () => {
        if (!(await checkLogin())){
            vscode.window.showInformationMessage('Please login first.');
            return;
        }
        
        const editor = vscode.window.activeTextEditor;
        let text: string;
        if (editor.selection.isEmpty) {
            text = vscode.window.activeTextEditor.document.getText();
        } else {
            const textRange = new vscode.Range(editor.selection.start.line, editor.selection.start.character, editor.selection.end.line, editor.selection.end.character);
            text = vscode.window.activeTextEditor.document.getText(textRange);
        }

        const filePath = vscode.workspace.asRelativePath(editor.document.uri.fsPath);
        const snippet = 
`---
title: public/${filePath}
---
> \`${filePath}\`
        
\`\`\`${editor.document.languageId}=${editor.selection.start.line + 1}
${text}
\`\`\``;

        const noteUrl = await API.newNote(snippet);
        const clicked = await vscode.window.showInformationMessage('New Snippet Established!', ...['Copy URL to clip board', 'Open in browser']);
        if (clicked === 'Copy URL to clip board') {
            vscode.env.clipboard.writeText(noteUrl);
        } else if (clicked === 'Open in browser') {
            vscode.env.openExternal(vscode.Uri.parse(noteUrl));
        }
    }));
}