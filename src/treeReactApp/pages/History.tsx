import useSWR from 'swr';

import { API } from '../../api';
import { NoteTreeItem } from '../components/NoteTreeItem';

export const History = () => {
  // TODO: mutate history list on refresh
  const { data = [] } = useSWR('history', () => API.getHistory());

  return (
    <>
      {data.map((note) => {
        return <NoteTreeItem key={note.id} note={note} />;
      })}
    </>
  );
};
