import * as vscode from 'vscode';

import { API } from './api';
import { meStore, recordUsage } from './treeReactApp/store';

export class File implements vscode.FileStat {
  type: vscode.FileType;
  ctime: number;
  mtime: number;
  size: number;

  name: string;
  data?: Uint8Array;
  permissions?: vscode.FilePermission;

  constructor(name: string, canEdit = false) {
    this.type = vscode.FileType.File;
    this.ctime = Date.now();
    this.mtime = Date.now();
    this.size = 0;
    this.name = name;
    if (!canEdit) {
      this.permissions = vscode.FilePermission.Readonly;
    }
  }
}

export class Directory implements vscode.FileStat {
  type: vscode.FileType;
  ctime: number;
  mtime: number;
  size: number;

  name: string;
  entries: Map<string, File | Directory>;

  constructor(name: string) {
    this.type = vscode.FileType.Directory;
    this.ctime = Date.now();
    this.mtime = Date.now();
    this.size = 0;
    this.name = name;
    this.entries = new Map();
  }
}

export type Entry = File | Directory;

export class HackMDFsProvider implements vscode.FileSystemProvider {
  createDirectory(uri: vscode.Uri): void | Thenable<void> {
    throw new Error('createDirectory Method not implemented.');
  }

  rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { readonly overwrite: boolean }): void | Thenable<void> {
    throw new Error('rename Method not implemented.');
  }

  stat(uri: vscode.Uri): vscode.FileStat | Thenable<vscode.FileStat> {
    return this._lookup(uri, false);
  }

  readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
    throw new Error('readDirectory Method not implemented.');
  }

  async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    const noteId = uri.fragment;

    try {
      const note = await recordUsage(API.getNote(noteId, { unwrapData: false }));
      const content = note.content;

      return Buffer.from(content);
    } catch (e) {
      console.error(e);
      throw vscode.FileSystemError.FileNotFound();
    }
  }

  async writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: { readonly create: boolean; readonly overwrite: boolean }
  ): Promise<void> {
    const noteId = uri.fragment;

    if (!noteId) {
      throw vscode.FileSystemError.FileNotFound();
    }

    try {
      const contentString = Buffer.from(content).toString();
      await recordUsage(API.updateNoteContent(noteId, contentString, { unwrapData: false }));
    } catch (e) {
      console.error(e);

      throw vscode.FileSystemError.Unavailable(
        'Try to save again when the internet connection is back. You can save a local copy on your computer for restoration.'
      );
    }
  }

  delete(uri: vscode.Uri, options: { readonly recursive: boolean }): void | Thenable<void> {
    throw new Error('Delete not implemented.');
  }

  private async _lookup(uri: vscode.Uri, silent: false): Promise<Entry>;
  private async _lookup(uri: vscode.Uri, silent: boolean): Promise<Entry | undefined>;
  private async _lookup(uri: vscode.Uri, silent: boolean): Promise<Entry | undefined> {
    const noteId = uri.fragment;

    try {
      const note = await recordUsage(API.getNote(noteId, { unwrapData: false }));

      const isOwner = meStore.getState().checkIsOwner(note);
      const file = new File(`${note.title}.md#${noteId}`, isOwner);
      file.data = Buffer.from(note.content);

      // TODO: ctime and size

      return file;
    } catch (e) {
      console.error(e);
      throw vscode.FileSystemError.FileNotFound();
    }
  }

  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();

  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

  watch(_resource: vscode.Uri): vscode.Disposable {
    // ignore, fires for all changes...
    return new vscode.Disposable(() => {
      /* noop */
    });
  }
}

let provider: HackMDFsProvider;

export function activate(context: vscode.ExtensionContext) {
  provider = new HackMDFsProvider();
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider('hackmd', provider, { isCaseSensitive: true })
  );
}
export function getProvider() {
  return provider;
}

export function generateResourceUri(label: string, noteId: string) {
  return vscode.Uri.parse(`hackmd:/${encodeURIComponent(label)}.md#${noteId}`);
}
