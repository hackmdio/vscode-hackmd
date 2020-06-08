import * as vscode from 'vscode';
import { API, apiExportType } from './api';

export class MdTextDocumentContentProvider implements vscode.TextDocumentContentProvider {
    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        const noteId = uri.fragment;
        const content = await API.exportString(noteId, apiExportType.MD);
        return content;
    }
}