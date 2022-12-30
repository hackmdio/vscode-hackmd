import useSWR from 'swr';

import { API } from '../../api';
import { NoteTreeItem } from '../components/NoteTreeItem';

export const MyNotes = () => {
  const { data = [] } = useSWR('/my-notes', () => API.getNoteList());

  return (
    <>
      {data.map((note) => {
        return <NoteTreeItem key={note.id} note={note} />;
      })}
    </>
  );
};
