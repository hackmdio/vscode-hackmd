import * as vscode from 'vscode';
import { store } from './store';
import * as apiClient from '@hackmd/api';

const API = new apiClient.default();
export const refreshHistoryList = async (context) => {
    if (await checkLogin()) {
        store.history = (await API.getHistory()).history;
    } else {
        store.history = [{}];
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