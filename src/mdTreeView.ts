import * as vscode from 'vscode';

export class MdTreeItemProvider implements vscode.TreeDataProvider<TreeNode> {
    constructor(public history: Array<any>) { }

    getTreeItem(element: TreeNode): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeNode): vscode.ProviderResult<TreeNode[]> {
        if (element === undefined) {
            return [new TreeNode("history", vscode.TreeItemCollapsibleState.Collapsed)]
        } else {
            return this.history.map(item =>
                new NoteTreeNode(item.id, item.text, vscode.TreeItemCollapsibleState.None)
            );
        }
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
