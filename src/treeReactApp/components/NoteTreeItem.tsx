import path from 'path';

import { Note } from '@hackmd/api/dist/type';
import { TreeItem } from '@hackmd/react-vsc-treeview';
import { useMemo } from 'react';

import { useAppContext } from '../AppContainer';
import { useMeStore } from '../store';

export const NoteTreeItem = ({ note }: { note: Note }) => {
  const context = useMemo(
    () => ({
      publishLink: note.publishLink,
      noteId: note.id,
    }),
    [note]
  );

  const { checkIsOwner } = useMeStore();

  const isOwner = checkIsOwner(note);

  const { extensionPath } = useAppContext();
  const iconPath = useMemo(() => {
    if (extensionPath) {
      if (isOwner) {
        return {
          light: path.join(extensionPath, 'images/icon/light/file-text.svg'),
          dark: path.join(extensionPath, 'images/icon/dark/file-text.svg'),
        };
      } else {
        return {
          light: path.join(extensionPath, 'images/icon/light/gist-secret.svg'),
          dark: path.join(extensionPath, 'images/icon/dark/gist-secret.svg'),
        };
      }
    } else {
      return undefined;
    }
  }, [extensionPath, isOwner]);

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
      contextValue={isOwner ? 'file' : 'lock-file'}
      context={context}
    />
  );
};
