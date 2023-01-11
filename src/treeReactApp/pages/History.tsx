import vscode from 'vscode';

import useSWR from 'swr';

import { API } from '../../api';
import { ErrorListItem } from '../components/ErrorListItem';
import { NoteTreeItem } from '../components/NoteTreeItem';
import { refreshHistoryEvent, useEventEmitter } from '../events';

export const History = () => {
  const {
    data = [],
    mutate,
    error,
  } = useSWR(
    'history',
    () =>
      vscode.window.withProgress(
        {
          location: { viewId: 'hackmd.tree.recent-notes' },
        },
        () => API.getHistory()
      ) as ReturnType<typeof API.getHistory>
  );

  useEventEmitter(refreshHistoryEvent, () => {
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
