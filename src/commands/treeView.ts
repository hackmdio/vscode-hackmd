import * as vscode from 'vscode';
import { Store } from '../store';
import * as apiClient from '@hackmd/api';
import { HackMDTreeViewProvider } from './../tree/index';
import { NoteTreeNode } from './../tree/nodes';
import { MdTextDocumentContentProvider } from './../mdTextDocument';
const API = new apiClient.default();

export async function registerTreeViewCommands(context: vscode.ExtensionContext, store: Store) {
    const hackMDTreeViewProvider = new HackMDTreeViewProvider(store);
    context.subscriptions.push(vscode.window.registerTreeDataProvider('mdTreeItems', hackMDTreeViewProvider));
    context.subscriptions.push(vscode.commands.registerCommand('treeView.refreshList', () => hackMDTreeViewProvider.refresh()));

    context.subscriptions.push(vscode.commands.registerCommand('clickTreeItem', async (label, noteId) => {
        if (label && noteId) {
            const content = await API.exportString(noteId, apiClient.ExportType.MD);
            if (content) {
                const uri = vscode.Uri.parse(`hackmd:${label}.md#${noteId}`);
                const doc = await vscode.workspace.openTextDocument(uri);
                await vscode.window.showTextDocument(doc, { preview: false });
            }
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('note.showPreview', async (node: NoteTreeNode) => {
        const noteNode = node;
        if (noteNode.label && noteNode.noteId) {
            const content = await API.exportString(noteNode.noteId, apiClient.ExportType.MD);
            if (content) {
                const uri = vscode.Uri.parse(`hackmd:${noteNode.label}.md#${noteNode.noteId}`);
                vscode.commands.executeCommand('markdown.showPreview', uri);
            }
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('note.showPreviewAndEditor', async (node: NoteTreeNode) => {
        const noteNode = node;
        if (noteNode.label && noteNode.noteId) {
            const content = await API.exportString(noteNode.noteId, apiClient.ExportType.MD);
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