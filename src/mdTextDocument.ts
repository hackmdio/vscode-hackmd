import * as vscode from 'vscode';
import * as apiClient from '@hackmd/api';
const API = new apiClient.default();

export class MdTextDocumentContentProvider implements vscode.TextDocumentContentProvider {
    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        const noteId = uri.fragment;
        const content = await API.exportString(noteId, apiClient.ExportType.MD);
        return content;
    }
}