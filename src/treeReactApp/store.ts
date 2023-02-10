import { Note } from '@hackmd/api/dist/type';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import { API } from '../api';

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

type UserState = {
  user: Awaited<ReturnType<typeof API.getMe>>;
  refreshLogin: () => Promise<void>;
  checkIsOwner: (note: Note) => boolean;
};

export const meStore = createStore<UserState>()((set) => ({
  user: null,
  refreshLogin: async () => {
    const currentUser = await API.getMe();
    set({ user: currentUser });
  },
  checkIsOwner: (note: Note) => {
    return note.userPath === meStore.getState().user.userPath;
  },
}));

export function useMeStore(): UserState;
export function useMeStore<T>(selector: (state: UserState) => T, equals?: (a: T, b: T) => boolean): T;
export function useMeStore<T>(selector?: (state: UserState) => T, equals?: (a: T, b: T) => boolean) {
  return useStore(meStore, selector!, equals);
}
