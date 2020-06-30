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
        if (editor.selection.isEmpty) {
            vscode.window.showInformationMessage('The code block is empty. Please select a range of text first.');
            return;
        }

        const textRange = new vscode.Range(editor.selection.start.line, editor.selection.start.character, editor.selection.end.line, editor.selection.end.character);
        const text = vscode.window.activeTextEditor.document.getText(textRange);
        const filePath = vscode.workspace.asRelativePath(editor.document.uri.fsPath);
        const snippet = `---\ntitle: public/${filePath}\n---\n> \`${filePath}\`\n\n\`\`\`${editor.document.languageId}=${editor.selection.start.line + 1}\n${text}\n\`\`\``;

        const noteUrl = await API.newNote(snippet);
        const clicked = await vscode.window.showInformationMessage('New Snippet Established!', ...['Copy URL to clip board', 'Open in browser']);
        if (clicked === 'Copy URL to clip board') {
            vscode.env.clipboard.writeText(noteUrl);
        } else if (clicked === 'Open in browser') {
            vscode.env.openExternal(vscode.Uri.parse(noteUrl));
        }
    }));
}