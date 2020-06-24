import * as vscode from 'vscode';
import { API, ExportType } from './api';

export class MdTextDocumentContentProvider implements vscode.TextDocumentContentProvider {
    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        const noteId = uri.fragment;
        const content = await API.exportString(noteId, ExportType.MD);
        return content;
    }
}