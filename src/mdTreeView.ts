import * as vscode from 'vscode';

export class MdTreeItemProvider implements vscode.TreeDataProvider<MdTreeItem> {
    constructor(public history: Array<any>){}

    getTreeItem(element: MdTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: MdTreeItem): vscode.ProviderResult<MdTreeItem[]> {
        return this.history.map(item => 
            new MdTreeItem(item.id as string, item.text as string, vscode.TreeItemCollapsibleState.None as vscode.TreeItemCollapsibleState)
        );
    }
}

export class MdTreeItem extends vscode.TreeItem {
    constructor(
        public readonly noteId: string,
        public readonly label: string,
        public readonly collapsibaleState: vscode.TreeItemCollapsibleState,
    ){
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