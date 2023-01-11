import vscode from 'vscode';

import useSWR from 'swr';

import { API } from '../../api';
import { ErrorListItem } from '../components/ErrorListItem';
import { NoteTreeItem } from '../components/NoteTreeItem';
import { refreshMyNotesEvent, useEventEmitter } from '../events';

export const MyNotes = () => {
  const {
    data = [],
    mutate,
    error,
  } = useSWR(
    '/my-notes',
    () =>
      vscode.window.withProgress(
        {
          location: { viewId: 'hackmd.tree.my-notes' },
        },
        () => API.getNoteList()
      ) as ReturnType<typeof API.getNoteList>
  );

  useEventEmitter(refreshMyNotesEvent, () => {
    mutate();
  });

  return (
    <>
      <ErrorListItem error={error} />

      {!error &&
        data.map((note) => {
          return <NoteTreeItem key={note.id} note={note} />;
        })}
    </>
  );
};
