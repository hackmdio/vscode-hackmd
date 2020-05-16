import { reaction } from "mobx";
import { store } from '.';
import * as vscode from 'vscode';

export async function initializeStorage(context: vscode.ExtensionContext) {
    store.history = context.globalState.get('history');
    reaction(
        () => [store.history],
        () => {
            context.globalState.update('history', store.history);
            vscode.commands.executeCommand("setContext", 'history', store.history);
        }
    );
}