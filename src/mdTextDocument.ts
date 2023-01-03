import * as vscode from 'vscode';

import { API } from './api';

const noteIdToNoteMap = new Map<string, string>();

export function getNoteIdPublishLink(noteId: string) {
  return noteIdToNoteMap.get(noteId);
}

export class MdTextDocumentContentProvider implements vscode.TextDocumentContentProvider {
  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  private _subscriptions: vscode.Disposable;

  async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
    const noteId = uri.fragment;
    const note = await API.getNote(noteId);
    const content = note.content;

    noteIdToNoteMap.set(noteId, note.publishLink);

    return content;
  }

  get onDidChange() {
    return this._onDidChange.event;
  }

  dispose() {
    this._subscriptions.dispose();
    // this._documents.clear();
    // this._editorDecoration.dispose();
    this._onDidChange.dispose();
  }
}
