import * as vscode from 'vscode';
import { checkLogin, login, refreshHistoryList, refreshLoginStatus } from './../utils';
import { API } from './../api';

export async function registerUserCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('HackMD.login', async () => {
        if (await checkLogin()) {
            vscode.window.showInformationMessage('Already logged in, please log out first.');
            return;
        }

        const email = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            password: false,
            placeHolder: 'email',
            prompt: 'Please enter your email account',
            validateInput: (text) => {
                if (text && text !== "") {
                    return undefined;
                } else {
                    return 'Email cannot be empty';
                }
            }
        });
        const password = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            password: true,
            placeHolder: 'password',
            prompt: 'Please enter your password',
            validateInput: (text) => {
                if (text && text !== "") {
                    return undefined;
                } else {
                    return 'password cannot be empty';
                }
            }
        });

        context.globalState.update('email', email);
        context.globalState.update('password', password);

        await login(context);
        await refreshHistoryList();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('HackMD.logout', async () => {
        if (!(await checkLogin())) {
          vscode.window.showInformationMessage('Currently not logged in.');
          return;
        }
        await API.logout();
        await refreshLoginStatus();
        await refreshHistoryList();
        vscode.window.showInformationMessage('Successfully logged out.');
      }));
}