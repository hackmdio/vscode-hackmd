import { Note } from '@hackmd/api/dist/type';
import { TreeItem } from 'react-vsc-treeview';

export const NoteTreeItem = ({ note }: { note: Note }) => {
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
      publishLink={note.id}
      noteId={note.id}
    />
  );
};
