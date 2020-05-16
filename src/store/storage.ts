import { reaction } from "mobx";
import { store } from '.';
import * as vscode from 'vscode';

export async function initializeStorage(context: vscode.ExtensionContext) {
    store.history = context.globalState.get('history');
    store.isLogin = context.globalState.get('isLogin');
    reaction(
        () => [store.history],
        () => {
            context.globalState.update('history', store.history);
            vscode.commands.executeCommand("setContext", 'history', store.history);

            context.globalState.update('isLogin', store.isLogin);
            vscode.commands.executeCommand("setContext", 'isLogin', store.isLogin);
        }
    );
}