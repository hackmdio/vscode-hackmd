import * as vscode from 'vscode';
import { HackMDTreeViewProvider } from './../tree/index';
import { NoteTreeNode } from './../tree/nodes';
import { MdTextDocumentContentProvider } from './../mdTextDocument';
import { refreshHistoryList, refreshLoginStatus, refreshLoginCredential } from './../utils';
import { API, ExportType } from './../api';

export async function registerTreeViewCommands(context: vscode.ExtensionContext) {
    const hackMDTreeViewProvider = new HackMDTreeViewProvider();
    context.subscriptions.push(vscode.window.registerTreeDataProvider('mdTreeItems', hackMDTreeViewProvider));
    context.subscriptions.push(vscode.commands.registerCommand('treeView.refreshList', async () => {
        await refreshLoginStatus();
        await refreshHistoryList();
        await refreshLoginCredential(context);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('clickTreeItem', async (label, noteId) => {
        if (label && noteId) {
            const content = await API.exportString(noteId, ExportType.MD);
            if (!checkNoteExist(content)) { return; }

            const uri = vscode.Uri.parse(`hackmd:${label}.md#${noteId}`);
            const doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc, { preview: false });

        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('HackMD.showPreview', async (noteNode: NoteTreeNode) => {
        if (noteNode) {
            const content = await API.exportString(noteNode.noteId, ExportType.MD);
            if (!checkNoteExist(content)) { return; }

            const uri = vscode.Uri.parse(`hackmd:${noteNode.label}.md#${noteNode.noteId}`);
            vscode.commands.executeCommand('markdown.showPreview', uri);
        } else {
            const editor = vscode.window.activeTextEditor;
            if (!checkEditorExist(editor)) { return; }

            const noteId = editor.document.uri.fragment;
            if (!checkNoteIdExist(noteId)) { return; }

            const content = await API.exportString(noteId, ExportType.MD);
            if (!checkNoteExist(content)) { return; }

            const fileName = editor.document.fileName.split('.')[0];
            const uri = vscode.Uri.parse(`hackmd:${fileName}.md#${noteId}`);
            vscode.commands.executeCommand('markdown.showPreview', uri);
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('HackMD.showPreviewAndEditor', async (noteNode: NoteTreeNode) => {
        if (noteNode) {
            const content = await API.exportString(noteNode.noteId, ExportType.MD);
            if (!checkNoteExist(content)) { return; }

            const uri = vscode.Uri.parse(`hackmd:${noteNode.label}.md#${noteNode.noteId}`);
            const doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc, { preview: false });
            vscode.commands.executeCommand('markdown.showPreviewToSide', uri);

        } else {
            const editor = vscode.window.activeTextEditor;
            if (!checkEditorExist(editor)) { return; }

            const noteId = editor.document.uri.fragment;
            if (!checkNoteIdExist(noteId)) { return; }

            const content = await API.exportString(noteId, ExportType.MD);
            if (!checkNoteExist(content)) { return; }

            const fileName = editor.document.fileName.split('.')[0];
            const uri = vscode.Uri.parse(`hackmd:${fileName}.md#${noteId}`);
            const doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc, { preview: false });
            vscode.commands.executeCommand('markdown.showPreviewToSide', uri);
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('HacKMD.openNoteOnHackMD', async (noteNode: NoteTreeNode) => {
        let noteId = '';
        if (noteNode) {
            noteId = noteNode.noteId;
        } else {
            noteId = vscode.window.activeTextEditor.document.uri.fragment;
        }
        if (!checkNoteIdExist(noteId)) { return; }

        const serverUrl = vscode.workspace.getConfiguration('Hackmd').get('serverURL') as string;
        const noteUrl = `${serverUrl}/${noteId}`;
        vscode.env.openExternal(vscode.Uri.parse(noteUrl));
    }));



    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('hackmd', new MdTextDocumentContentProvider()));
}

const checkEditorExist = (editor) => {
    if (editor) {
        return true;
    } else {
        vscode.window.showInformationMessage('Current window is not a text editor. Please open one first.');
        return false;
    }
};

const checkNoteIdExist = (noteId) => {
    if (noteId) {
        return true;
    } else {
        vscode.window.showInformationMessage("Please open a note first");
        return false;
    }
};

const checkNoteExist = (content) => {
    if (content) {
        return true;
    } else {
        vscode.window.showInformationMessage("Can't find the note from HackMD. Make sure it's still exist.");
        return false;
    }
};

