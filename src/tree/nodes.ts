import * as vscode from 'vscode';

export class TreeNode extends vscode.TreeItem {
  constructor(public readonly label: string, public readonly collapsibaleState: vscode.TreeItemCollapsibleState) {
    super(label, collapsibaleState);
    this.command = {
      title: '',
      command: 'clickTreeItem',
      arguments: [this.label],
    };
  }
}

export class NoteTreeNode extends TreeNode {
  constructor(
    public readonly noteId: string,
    public readonly label: string,
    public readonly collapsibaleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibaleState);
    this.command = {
      title: '',
      command: 'clickTreeItem',
      arguments: [this.label, this.noteId],
    };
    this.contextValue = 'file';
  }
}
