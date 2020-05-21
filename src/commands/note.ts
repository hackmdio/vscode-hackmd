import * as vscode from 'vscode';
import * as apiClient from '@hackmd/api';
import { checkLogin } from './../utils';
const API = new apiClient.default();

export async function registerNoteCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('HackMD.createActiveEditorContentToHackMD', async () => {
        if (!(await checkLogin())) {
            vscode.window.showInformationMessage('Please login first.');
            return;
        }

        const mdText = vscode.window.activeTextEditor.document.getText();
        const noteUrl = await API.newNote(mdText);
        const clicked = await vscode.window.showInformationMessage('New note Established!', ...['Copy URL to clip board', 'Open in browser']);
        if (clicked === 'Copy URL to clip board') {
            vscode.env.clipboard.writeText(noteUrl);
        } else if (clicked === 'Open in browser') {
            vscode.env.openExternal(vscode.Uri.parse(noteUrl));
        }
    }));
}