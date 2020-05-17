import * as vscode from 'vscode';
import * as apiClient from '@hackmd/api';
import { checkLogin } from './../utils';
const API = new apiClient.default();

export async function registerNoteCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('note.newNote', async () => {
        if (!(await checkLogin())) {
            vscode.window.showInformationMessage('Please login first.');
            return;
        }
        const mdText = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            password: false,
            placeHolder: 'MarkDown content',
            prompt: 'Please write down your note text',
        });

        const noteUrl = await API.newNote(mdText);
        const clicked = await vscode.window.showInformationMessage('New note Established!', ...['Copy URL to clip board', 'Open in browser']);
        if (clicked === 'Copy URL to clip board') {
            vscode.env.clipboard.writeText(noteUrl);
        } else if (clicked === 'Open in browser') {
            vscode.env.openExternal(vscode.Uri.parse(noteUrl));
        }
    }));
}