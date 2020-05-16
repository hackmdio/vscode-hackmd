import * as vscode from 'vscode';
import { Store, store } from './store';
import { reaction } from 'mobx';
// const history = (await API.getHistory()).history;
export class MdTreeItemProvider implements vscode.TreeDataProvider<TreeNode> {
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

export class TreeNode extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibaleState: vscode.TreeItemCollapsibleState,
    ) {
        super(label, collapsibaleState);
        this.command = {
            title: '',
            command: 'clickTreeItem',
            arguments: [
                this.label,
            ]
        }
    }
}

export class NoteTreeNode extends TreeNode {
    constructor(
        public readonly noteId: string,
        public readonly label: string,
        public readonly collapsibaleState: vscode.TreeItemCollapsibleState,
    ) {
        super(label, collapsibaleState);
        this.command = {
            title: '',
            command: 'clickTreeItem',
            arguments: [
                this.label,
                this.noteId
            ]
        }
    }
}
