import * as vscode from 'vscode';

import ApiClient from '@hackmd/api';

import { ACCESS_TOKEN_KEY } from './constants';

let API: ApiClient;

export async function initializeAPIClient(context: vscode.ExtensionContext) {
  let accessToken = await context.secrets.get(ACCESS_TOKEN_KEY);
  const apiEndPoint = vscode.workspace.getConfiguration('Hackmd').get('apiEndPoint') as string;

  if (!accessToken) {
    const input = await vscode.window.showInputBox({
      prompt: 'Please input your HackMD access token',
      password: true,
      ignoreFocusOut: true,
      placeHolder: 'Access Token',
      title: 'HackMD Access Token',
    });

    if (!input) {
      return;
    }

    await context.secrets.store(ACCESS_TOKEN_KEY, input);
    accessToken = input;
  }

  API = new ApiClient(accessToken, apiEndPoint);
}

vscode.workspace.onDidChangeConfiguration(async (e) => {
  if (e.affectsConfiguration('Hackmd')) {
    const extension = vscode.extensions.getExtension<{ context: vscode.ExtensionContext }>('hackmd.hackmd-vscode');
    await initializeAPIClient(extension.exports.context);
  }
});

export { API };
