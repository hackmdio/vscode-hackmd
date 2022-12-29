import { API } from '../../api';
import { NoteTreeItem } from '../components/NoteTreeItem';
import { usePromise } from '../utils/usePromise';

export const History = () => {
  // TODO: mutate history list on refresh
  const { data = [] } = usePromise(() => API.getHistory(), ['history']);

  return (
    <>
      {data.map((note) => {
        return <NoteTreeItem key={note.id} note={note} />;
      })}
    </>
  );
};
