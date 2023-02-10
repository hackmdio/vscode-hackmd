import path from 'path';

import { Note } from '@hackmd/api/dist/type';
import { TreeItem } from '@hackmd/react-vsc-treeview';
import { useMemo } from 'react';

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
      if (note.teamPath) {
        return {
          light: path.join(extensionPath, 'images/icon/light/gist-secret.svg'),
          dark: path.join(extensionPath, 'images/icon/dark/gist-secret.svg'),
        };
      } else {
        return {
          light: path.join(extensionPath, 'images/icon/light/file-text.svg'),
          dark: path.join(extensionPath, 'images/icon/dark/file-text.svg'),
        };
      }
    } else {
      return undefined;
    }
  }, [extensionPath, note.teamPath]);

  return (
    <TreeItem
      label={note.title}
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
