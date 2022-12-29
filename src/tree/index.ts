import * as vscode from 'vscode';

import { reaction } from 'mobx';

import { store } from '../store';

import { TreeNode, NoteTreeNode } from './nodes';

export class HackMDTreeViewProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeNode>();
  public readonly onDidChangeTreeData: vscode.Event<TreeNode> = this._onDidChangeTreeData.event;
  constructor() {
    reaction(
      () => [store.history, store.isLogin],
      async () => {
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
        return [new TreeNode('history', vscode.TreeItemCollapsibleState.Collapsed)];
      } else {
        return store.history.map((item) => new NoteTreeNode(item.id, item.text, vscode.TreeItemCollapsibleState.None));
      }
    }
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }
}
