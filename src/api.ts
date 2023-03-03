import * as vscode from 'vscode';

import ApiClient from '@hackmd/api';

import { ACCESS_TOKEN_KEY } from './constants';
import { meStore } from './treeReactApp/store';

let API: ApiClient;

export async function initializeAPIClient(context: vscode.ExtensionContext, forceShowInputBox = false) {
  let accessToken = await context.secrets.get(ACCESS_TOKEN_KEY);
  const apiEndPoint = vscode.workspace.getConfiguration('Hackmd').get('apiEndPoint') as string;

  if (!accessToken || forceShowInputBox) {
    const input = await vscode.window.showInputBox({
      prompt: 'Please input your HackMD access token',
      password: true,
      ignoreFocusOut: true,
      placeHolder: 'Access Token',
      title: 'HackMD Access Token',
      value: accessToken,
    });

    if (!input) {
      return;
    }

    await context.secrets.store(ACCESS_TOKEN_KEY, input);
    accessToken = input;
  }

  API = new ApiClient(accessToken, apiEndPoint, { wrapResponseErrors: false });
  await meStore.getState().refreshLogin();
}

export async function forceRefreshAPIClient(context: vscode.ExtensionContext) {
  await initializeAPIClient(context, true);
}

vscode.workspace.onDidChangeConfiguration(async (e) => {
  if (e.affectsConfiguration('Hackmd')) {
    const extension = vscode.extensions.getExtension<{ context: vscode.ExtensionContext }>('HackMD.hackmd-vscode');
    await initializeAPIClient(extension.exports.context);
  }
});

export { API };
