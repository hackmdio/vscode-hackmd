import { Note } from '@hackmd/api/dist/type';
import { useMemo } from 'react';
import { TreeItem } from 'react-vsc-treeview';

export const NoteTreeItem = ({ note }: { note: Note }) => {
  const context = useMemo(
    () => ({
      publishLink: note.publishLink,
      noteId: note.id,
    }),
    [note]
  );

  return (
    <TreeItem
      label={note.title}
      id={note.id}
      command={{
        title: '',
        command: 'clickTreeItem',
        arguments: [note.title, note.id],
      }}
      contextValue="file"
      context={context}
    />
  );
};
