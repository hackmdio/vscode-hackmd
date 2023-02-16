import { Note } from '@hackmd/api/dist/type';
import type { AxiosResponse } from 'axios';
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

// X-RateLimit-UserLimit
// X-RateLimit-UserRemaining
type APIUsageState = {
  userLimit: number;
  userRemaining: number;
  updateState: (userLimit: number, userRemaining: number) => void;
};
export const apiStore = createStore<APIUsageState>()((set) => ({
  userLimit: null,
  userRemaining: null,
  updateState: (userLimit: number, userRemaining: number) => set({ userLimit, userRemaining }),
}));

export function useApiStore(): APIUsageState;
export function useApiStore<T>(selector: (state: APIUsageState) => T, equals?: (a: T, b: T) => boolean): T;
export function useApiStore<T>(selector?: (state: APIUsageState) => T, equals?: (a: T, b: T) => boolean) {
  return useStore(apiStore, selector!, equals);
}

export async function recordUsage<T>(promise: Promise<AxiosResponse<T>>): Promise<T> {
  const response = await promise;
  const userLimit = parseInt(response.headers['x-ratelimit-userlimit'] as string, 10);
  const userRemaining = parseInt(response.headers['x-ratelimit-userremaining'] as string, 10);

  apiStore.getState().updateState(userLimit, userRemaining);

  return response.data;
}

type UserState = {
  user: Awaited<ReturnType<typeof API.getMe>>;
  refreshLogin: () => Promise<void>;
  checkIsOwner: (note: Note) => boolean;
};

export const meStore = createStore<UserState>()((set) => ({
  user: null,
  refreshLogin: async () => {
    const currentUser = await recordUsage(API.getMe({ unwrapData: false }));
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
