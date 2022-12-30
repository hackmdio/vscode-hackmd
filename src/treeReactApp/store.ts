import createReact from 'zustand';
import create from 'zustand/vanilla';

type TeamNoteStore = {
  selectedTeamId: string;
  setSelectedTeamId: (id: string) => void;
};

export const teamNotesStore = create<TeamNoteStore>()((set) => ({
  selectedTeamId: null,
  setSelectedTeamId: (id: string) => set({ selectedTeamId: id }),
}));

export const useTeamNotesStore = createReact(teamNotesStore);
