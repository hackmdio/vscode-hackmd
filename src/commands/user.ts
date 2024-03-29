import * as vscode from 'vscode';

import { forceRefreshAPIClient } from '../api';
import { refreshHistoryEvent, refreshMyNotesEvent, refreshTeamNotesEvent } from '../treeReactApp/events';

export async function registerUserCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('HackMD.apiKey', async () => {
      await forceRefreshAPIClient(context);

      refreshHistoryEvent.fire();
      refreshMyNotesEvent.fire();
      refreshTeamNotesEvent.fire();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('HackMD.upgrade', async () => {
      vscode.env.openExternal(vscode.Uri.parse('https://hackmd.io/settings#api'));
    })
  );
}
