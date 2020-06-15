import * as vscode from 'vscode';
import { checkLogin } from './../utils';
import { API } from './../api';

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

    context.subscriptions.push(vscode.commands.registerCommand('HacKMD.openNoteOnHackMD', () => {
        const noteId = vscode.window.activeTextEditor.document.uri.fragment;
        if (!noteId) {
            vscode.window.showInformationMessage('Please open an editor first');
        }
        const serverUrl = vscode.workspace.getConfiguration('Hackmd').get('serverURL') as string;
        const noteUrl = `${serverUrl}/${noteId}`;
        vscode.env.openExternal(vscode.Uri.parse(noteUrl));
    }));
}