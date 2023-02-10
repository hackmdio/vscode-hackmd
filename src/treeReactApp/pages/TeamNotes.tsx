import path from 'path';
import vscode from 'vscode';

import { Team } from '@hackmd/api/dist/type';
import { TreeItem } from '@hackmd/react-vsc-treeview';
import { useMemo } from 'react';
import useSWR from 'swr';

import { API } from '../../api';
import { useAppContext } from '../AppContainer';
import { ErrorListItem } from '../components/ErrorListItem';
import { NoteTreeItem } from '../components/NoteTreeItem';
import { refreshTeamNotesEvent, useEventEmitter } from '../events';
import { useTeamNotesStore } from '../store';

const TeamTreeItem = ({ team }: { team: Team }) => {
  const { data: notes = [], mutate } = useSWR(
    () => (team ? `/teams/${team.id}/notes` : null),
    () =>
      vscode.window.withProgress(
        {
          location: { viewId: 'hackmd.tree.team-notes' },
        },
        () => API.getTeamNotes(team.path)
      ) as ReturnType<typeof API.getTeamNotes>
  );

  const { extensionPath } = useAppContext();
  const iconPath = useMemo(() => {
    if (extensionPath) {
      return {
        light: path.join(extensionPath, 'images/icon/light/users.svg'),
        dark: path.join(extensionPath, 'images/icon/dark/users.svg'),
      };
    } else {
      return undefined;
    }
  }, [extensionPath]);

  useEventEmitter(refreshTeamNotesEvent, () => {
    mutate();
  });

  return (
    <TreeItem label={team.name} expanded iconPath={iconPath} description={team.path}>
      {notes.map((note) => {
        return <NoteTreeItem key={note.id} note={note} />;
      })}

      {notes.length === 0 && <TreeItem label="No notes" />}
    </TreeItem>
  );
};

export const TeamNotes = () => {
  const { data: teams = [], mutate, error } = useSWR('/teams', () => API.getTeams());
  const { selectedTeamId } = useTeamNotesStore();

  const selectedTeam = useMemo(() => teams.find((t) => t.id === selectedTeamId), [teams, selectedTeamId]);

  useEventEmitter(refreshTeamNotesEvent, () => {
    mutate();
  });

  return (
    <>
      <ErrorListItem error={error} />

      {!error && (
        <TreeItem
          label="Click to select a team"
          command={{
            title: 'Select a team',
            command: 'HackMD.selectTeam',
          }}
        />
      )}

      {!error && selectedTeam && <TeamTreeItem team={selectedTeam} />}
    </>
  );
};
