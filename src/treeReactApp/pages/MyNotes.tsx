import { API } from '../../api';
import { NoteTreeItem } from '../components/NoteTreeItem';
import { usePromise } from '../utils/usePromise';

export const MyNotes = () => {
  const { data = [] } = usePromise(() => API.getNoteList(), ['myNotes']);

  return (
    <>
      {data.map((note) => {
        return <NoteTreeItem key={note.id} note={note} />;
      })}
    </>
  );
};
