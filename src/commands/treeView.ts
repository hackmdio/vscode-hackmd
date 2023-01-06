import * as vscode from 'vscode';

import { Team } from '@hackmd/api/dist/type';

import { refreshMyNotesEvent, refreshHistoryEvent, refreshTeamNotesEvent } from '../treeReactApp/events';
import { teamNotesStore } from '../treeReactApp/store';

import { API } from './../api';
import { MdTextDocumentContentProvider, getNoteIdPublishLink } from './../mdTextDocument';
import { ReactVSCTreeNode } from './../tree/nodes';

export async function registerTreeViewCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('treeView.refreshMyNotes', async () => {
      refreshMyNotesEvent.fire();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('treeView.refreshHistory', async () => {
      refreshHistoryEvent.fire();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('treeView.refreshTeamNotes', async () => {
      refreshTeamNotesEvent.fire();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('clickTreeItem', async (label, noteId) => {
      if (label && noteId) {
        const uri = vscode.Uri.parse(`hackmd:/${label}.md#${noteId}`);
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc, { preview: false });
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('selectTeam', async () => {
      const teams = await API.getTeams();

      const getTeamLabel = (team: Team) => `${team.name} [${team.path}]`;

      await vscode.window.showQuickPick(teams.map(getTeamLabel)).then((selectedTeam) => {
        if (!selectedTeam) {
          return;
        }

        const selectedTeamId = teams.find((team) => getTeamLabel(team) === selectedTeam)?.id;

        teamNotesStore.setState({ selectedTeamId });
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('HackMD.showPreview', async (noteNode: ReactVSCTreeNode) => {
      if (noteNode) {
        const { noteId } = noteNode.value.context;
        const { label } = noteNode.value;

        const uri = vscode.Uri.parse(`hackmd:/${label}.md#${noteId}`);
        vscode.commands.executeCommand('markdown.showPreview', uri);
      } else {
        const editor = vscode.window.activeTextEditor;
        if (!checkEditorExist(editor)) {
          return;
        }

        const noteId = editor.document.uri.fragment;
        if (!checkNoteIdExist(noteId)) {
          return;
        }

        const lastIndex = editor.document.fileName.lastIndexOf('.');
        const fileName = editor.document.fileName.slice(0, lastIndex + 1);
        const uri = vscode.Uri.parse(`hackmd:/${fileName}.md#${noteId}`);
        vscode.commands.executeCommand('markdown.showPreview', uri);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('HackMD.showPreviewAndEditor', async (noteNode: ReactVSCTreeNode) => {
      if (noteNode) {
        const { noteId } = noteNode.value.context;
        const { label } = noteNode.value;

        const uri = vscode.Uri.parse(`hackmd:/${label}.md#${noteId}`);
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc, { preview: false });
        vscode.commands.executeCommand('markdown.showPreviewToSide', uri);
      } else {
        const editor = vscode.window.activeTextEditor;
        if (!checkEditorExist(editor)) {
          return;
        }

        const noteId = editor.document.uri.fragment;
        if (!checkNoteIdExist(noteId)) {
          return;
        }

        const { content } = await API.getNote(noteId);
        if (!checkNoteExist(content)) {
          return;
        }

        const lastIndex = editor.document.fileName.lastIndexOf('.');
        const fileName = editor.document.fileName.slice(0, lastIndex + 1);
        const uri = vscode.Uri.parse(`hackmd:/${fileName}.md#${noteId}`);
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc, { preview: false });
        vscode.commands.executeCommand('markdown.showPreviewToSide', uri);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('HacKMD.openNoteOnHackMD', async (noteNode: ReactVSCTreeNode) => {
      if (noteNode) {
        const publishLink = noteNode.value.context.publishLink;
        vscode.env.openExternal(vscode.Uri.parse(publishLink));
      } else {
        const noteId = vscode.window.activeTextEditor.document.uri.fragment;
        const publishLink = getNoteIdPublishLink(noteId);

        if (publishLink) {
          vscode.env.openExternal(vscode.Uri.parse(publishLink));
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider('hackmd', new MdTextDocumentContentProvider())
  );
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
    vscode.window.showInformationMessage('Please open a note first');
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
