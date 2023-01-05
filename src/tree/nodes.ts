import * as vscode from 'vscode';

interface TreeWithContext extends vscode.TreeItem {
  readonly context: Record<string, any>;
}

export interface ReactVSCTreeNode {
  readonly value: TreeWithContext;
}
