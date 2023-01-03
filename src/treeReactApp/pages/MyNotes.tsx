import useSWR from 'swr';

import { API } from '../../api';
import { ErrorListItem } from '../components/ErrorListItem';
import { NoteTreeItem } from '../components/NoteTreeItem';
import { refreshMyNotesEvent, useEventEmitter } from '../events';

export const MyNotes = () => {
  const { data = [], mutate, error } = useSWR('/my-notes', () => API.getNoteList());

  useEventEmitter(refreshMyNotesEvent, () => {
    mutate();
  });

  return (
    <>
      {data.map((note) => {
        return <NoteTreeItem key={note.id} note={note} />;
      })}

      <ErrorListItem error={error} />
    </>
  );
};
