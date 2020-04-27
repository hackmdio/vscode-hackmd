import * as vscode from 'vscode';

export class MdTreeItemProvider implements vscode.TreeDataProvider<MdTreeItem> {
    constructor(public noteList: Array<string>){}

    getTreeItem(element: MdTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: MdTreeItem): vscode.ProviderResult<MdTreeItem[]> {
        return this.noteList.map(item => 
            new MdTreeItem(item as string, vscode.TreeItemCollapsibleState.None as vscode.TreeItemCollapsibleState)
        );
    }
}

export class MdTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibaleState: vscode.TreeItemCollapsibleState
    ){
        super(label, collapsibaleState);
    }
}