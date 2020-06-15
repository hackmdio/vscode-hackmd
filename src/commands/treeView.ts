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
            if (content) {
                const uri = vscode.Uri.parse(`hackmd:${label}.md#${noteId}`);
                const doc = await vscode.workspace.openTextDocument(uri);
                await vscode.window.showTextDocument(doc, { preview: false });
            }
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('note.showPreview', async (noteNode: NoteTreeNode) => {
        if (noteNode.label && noteNode.noteId) {
            const content = await API.exportString(noteNode.noteId, ExportType.MD);
            if (content) {
                const uri = vscode.Uri.parse(`hackmd:${noteNode.label}.md#${noteNode.noteId}`);
                vscode.commands.executeCommand('markdown.showPreview', uri);
            }
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('note.showPreviewAndEditor', async (noteNode: NoteTreeNode) => {
        if (noteNode.label && noteNode.noteId) {
            const content = await API.exportString(noteNode.noteId, ExportType.MD);
            if (content) {
                const uri = vscode.Uri.parse(`hackmd:${noteNode.label}.md#${noteNode.noteId}`);
                const doc = await vscode.workspace.openTextDocument(uri);
                await vscode.window.showTextDocument(doc, { preview: false });
                vscode.commands.executeCommand('markdown.showPreviewToSide', uri);
            }
        }
    }));

    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('hackmd', new MdTextDocumentContentProvider()));
}