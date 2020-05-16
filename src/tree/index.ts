import * as vscode from 'vscode';
import { Store, store } from '../store';
import { reaction } from 'mobx';
import { TreeNode, NoteTreeNode } from './nodes';
import * as apiClient from '@hackmd/api';
const API = new apiClient.default();

export class HackMDTreeViewProvider implements vscode.TreeDataProvider<TreeNode> {
    private _onDidChangeTreeData = new vscode.EventEmitter<TreeNode>();
    public readonly onDidChangeTreeData: vscode.Event<TreeNode> = this._onDidChangeTreeData.event;
    constructor(private store: Store) {
        reaction(
            () => [
                store.history
            ],
            () => {
                this.refresh();
            }
        );
    }

    getTreeItem(element: TreeNode): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeNode): vscode.ProviderResult<TreeNode[]> {
        if (store.isLogin) {
            if (element === undefined) {
                return [new TreeNode("history", vscode.TreeItemCollapsibleState.Collapsed)]
            } else {
                return this.store.history.map(item =>
                    new NoteTreeNode(item.id, item.text, vscode.TreeItemCollapsibleState.None)
                );
            }
        }
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }
}

export const refreshHistoryList = async (context) => {
    if (await checkLogin()) {
        store.history = (await API.getHistory()).history;
        context.globalState.update('history', store.history);
    } else {
        store.history = [{}];
        context.globalState.update('history', [{}]);
    }
};

export const checkLogin = async () => {
    return (await API.getMe()).status === 'ok';
};

export const login = async (context: vscode.ExtensionContext) => {
    const { email, password } = getLoginCredential(context);
    if (!email || !password) {
        vscode.window.showInformationMessage('Please enter your email and password to use HackMD extension!')
        return;
    }
    await API.login(email, password);
    if (await checkLogin()) {
        store.isLogin = true;
        context.globalState.update('isLogin', true);
        vscode.window.showInformationMessage('Successfully login!');
    } else {
        vscode.window.showInformationMessage('Wrong email or password, please enter again');
    }
};

export const getLoginCredential = (context: vscode.ExtensionContext) => {
    const email: string = context.globalState.get('email');
    const password: string = context.globalState.get('password');
    return { email, password };
};