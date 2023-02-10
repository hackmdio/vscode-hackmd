import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

type TeamNoteState = {
  selectedTeamId: string;
  setSelectedTeamId: (id: string) => void;
};

export const teamNotesStore = createStore<TeamNoteState>()((set) => ({
  selectedTeamId: null,
  setSelectedTeamId: (selectedTeamId: string) => set({ selectedTeamId }),
}));

export function useTeamNotesStore(): TeamNoteState;
export function useTeamNotesStore<T>(selector: (state: TeamNoteState) => T, equals?: (a: T, b: T) => boolean): T;
export function useTeamNotesStore<T>(selector?: (state: TeamNoteState) => T, equals?: (a: T, b: T) => boolean) {
  return useStore(teamNotesStore, selector!, equals);
}
