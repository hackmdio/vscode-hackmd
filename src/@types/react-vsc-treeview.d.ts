declare module 'react-vsc-treeview' {
  import React from 'react';
  import { TreeItemProps } from 'react-vsc-treeview/dist/TreeItem';

  export const TreeItem: (
    props: TreeItemProps & { key?: any; children?: React.ReactNode; context?: Record<string, any> }
  ) => React.ReactElement;
}
