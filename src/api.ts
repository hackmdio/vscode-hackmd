import APIClient from '@hackmd/api';
import { ExportType } from '@hackmd/api';
import * as vscode from 'vscode';
const config = {
    serverUrl: vscode.workspace.getConfiguration('Hackmd').get('serverURL') as string,
    enterprise: vscode.workspace.getConfiguration('Hackmd').get('enterprise') as boolean
};
const API = new APIClient(config);
vscode.workspace.onDidChangeConfiguration(async e => {
    if (e.affectsConfiguration('Hackmd')) {
        const clicked = await vscode.window.showInformationMessage('Setting updated. Restart to apply this change.', ...['Restart']);
        if (clicked === 'Restart') {
            vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
    }
});

export { API, ExportType };
