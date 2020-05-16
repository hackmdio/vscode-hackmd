import * as vscode from 'vscode'
import { checkLogin, login, refreshHistoryList } from './../tree/index'
import { Store } from '../store';
import * as apiClient from '@hackmd/api';
const API = new apiClient.default();

export async function registerUserCommands(context: vscode.ExtensionContext, store: Store) {
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
        await refreshHistoryList(context);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('HackMD.logout', async () => {
        if (!(await checkLogin())) {
          vscode.window.showInformationMessage('Currently not logged in.');
          return;
        }
        await API.logout();
        store.isLogin = false;
        context.globalState.update('isLogin', false);
        vscode.window.showInformationMessage('Successfully logged out.');
        await refreshHistoryList(context);
      }));
}