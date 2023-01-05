import path from 'path';

import { Note } from '@hackmd/api/dist/type';
import { useMemo } from 'react';
import { TreeItem } from 'react-vsc-treeview';

import { useAppContext } from '../AppContainer';

export const NoteTreeItem = ({ note }: { note: Note }) => {
  const context = useMemo(
    () => ({
      publishLink: note.publishLink,
      noteId: note.id,
    }),
    [note]
  );

  const { extensionPath } = useAppContext();
  const iconPath = useMemo(() => {
    if (extensionPath) {
      return {
        light: path.join(extensionPath, 'images/icon/light/file-text.svg'),
        dark: path.join(extensionPath, 'images/icon/dark/file-text.svg'),
      };
    } else {
      return undefined;
    }
  }, [extensionPath]);

  return (
    <TreeItem
      label={note.title}
      id={note.id}
      iconPath={iconPath}
      command={{
        title: '',
        command: 'clickTreeItem',
        arguments: [note.title, note.id],
      }}
      description={note.tags?.join(', ') || ''}
      contextValue="file"
      context={context}
    />
  );
};
