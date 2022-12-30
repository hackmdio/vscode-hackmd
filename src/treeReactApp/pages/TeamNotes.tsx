import { Team } from '@hackmd/api/dist/type';
import { useEffect, useMemo, useState } from 'react';
import { TreeItem } from 'react-vsc-treeview';
import useSWR from 'swr';

import { API } from '../../api';
import { NoteTreeItem } from '../components/NoteTreeItem';
import { useTeamNotesStore } from '../store';

const TeamTreeItem = ({ team }: { team: Team }) => {
  const { data: notes = [] } = useSWR(
    () => (team ? `/teams/${team.id}/notes` : null),
    () => API.getTeamNotes(team.path)
  );

  return (
    <TreeItem label={team.name} expanded>
      {notes.map((note) => {
        return <NoteTreeItem key={note.id} note={note} />;
      })}

      {notes.length === 0 && <TreeItem label="No notes" />}
    </TreeItem>
  );
};

export const TeamNotes = () => {
  const { data: teams = [] } = useSWR('/teams', () => API.getTeams());
  const [selectedTeamId, setSelectedTeamId] = useState(useTeamNotesStore.getState().selectedTeamId);

  // I'm not sure why using useTeamNotesStore doesn't trigger re-render
  // So we use useEffect to subscribe to the zustand store and update the useState we use in the component
  useEffect(() => {
    useTeamNotesStore.subscribe((state) => setSelectedTeamId(state.selectedTeamId));
  }, []);

  const selectedTeam = useMemo(() => teams.find((t) => t.id === selectedTeamId), [teams, selectedTeamId]);

  return (
    <>
      <TreeItem
        label="Click to select a team"
        command={{
          title: 'Select a team',
          command: 'selectTeam',
        }}
      />

      {selectedTeam && <TeamTreeItem team={selectedTeam} />}
    </>
  );
};
