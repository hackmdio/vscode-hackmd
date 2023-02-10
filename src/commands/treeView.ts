import * as vscode from 'vscode';

import { Team } from '@hackmd/api/dist/type';

import { generateResourceUri } from '../mdFsProvider';
import { refreshMyNotesEvent, refreshHistoryEvent, refreshTeamNotesEvent } from '../treeReactApp/events';
import { teamNotesStore } from '../treeReactApp/store';

import { API } from './../api';
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
    vscode.commands.registerCommand('treeView.createMyNotes', async () => {
      const note = await API.createNote({});

      const uri = generateResourceUri(note.title, note.id);
      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc, { preview: false });

      vscode.commands.executeCommand('treeView.refreshMyNotes');
    })
  );

  // HackMD.deleteMyNote
  context.subscriptions.push(
    vscode.commands.registerCommand('HackMD.deleteMyNote', async (noteNode: ReactVSCTreeNode) => {
      if (noteNode) {
        const { noteId } = noteNode.value.context;

        // prompt
        const confirm = await vscode.window.showWarningMessage(
          'Are you sure to delete this note?',
          { modal: true },
          'Yes'
        );

        if (!confirm) {
          return;
        }

        await API.deleteNote(noteId);

        vscode.commands.executeCommand('treeView.refreshMyNotes');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('clickTreeItem', async (label, noteId) => {
      if (label && noteId) {
        const uri = generateResourceUri(label, noteId);
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc, { preview: false });
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('HackMD.selectTeam', async () => {
      const teams = await API.getTeams();

      const getTeamLabel = (team: Team) => `${team.name} [${team.path}]`;

      await vscode.window.showQuickPick(teams.map(getTeamLabel)).then((selectedTeam) => {
        if (!selectedTeam) {
          return;
        }

        const selectedTeamId = teams.find((team) => getTeamLabel(team) === selectedTeam)?.id;

        const { setSelectedTeamId } = teamNotesStore.getState();
        setSelectedTeamId(selectedTeamId);
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('HackMD.showPreview', async (noteNode: ReactVSCTreeNode) => {
      if (noteNode) {
        const { noteId } = noteNode.value.context;
        const { label } = noteNode.value;

        const uri = generateResourceUri(label.toString(), noteId);
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
        const uri = generateResourceUri(fileName, noteId);
        vscode.commands.executeCommand('markdown.showPreview', uri);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('HackMD.showPreviewAndEditor', async (noteNode: ReactVSCTreeNode) => {
      if (noteNode) {
        const { noteId } = noteNode.value.context;
        const { label } = noteNode.value;

        const uri = generateResourceUri(label.toString(), noteId);
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
        const uri = generateResourceUri(fileName, noteId);
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

        const note = await API.getNote(noteId);

        if (note && note.publishLink) {
          vscode.env.openExternal(vscode.Uri.parse(note.publishLink));
        }
      }
    })
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
