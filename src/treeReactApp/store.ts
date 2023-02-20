import * as vscode from 'vscode';

import { Note } from '@hackmd/api/dist/type';
import type { AxiosResponse } from 'axios';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import { API } from '../api';

import {
  hideStatusbarItem,
  sendLimitAlmostReachedNotification,
  sendLimitReachedNotification,
  updateStatusbarItem,
} from './usageLimitNotification';

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

type UsageLimitRecord = {
  limit: number;
  remaining: number;
  limitReachedNotificationSent?: boolean;
  limitAlmostReachedNotificationSent?: boolean;
};

// X-RateLimit-UserLimit
// X-RateLimit-UserRemaining
type APIUsageState = {
  userRecord: UsageLimitRecord;
  updateUserState: (userLimit: number, userRemaining: number) => void;

  teamRecordsById: Record<string, UsageLimitRecord>;
  updateTeamUsageLimitRecord: (teamId: string, limit: number, remaining: number) => void;
};
export const apiStore = createStore<APIUsageState>()((set) => ({
  userRecord: {
    limit: null,
    remaining: null,
    limitAlmostReachedNotificationSent: false,
    limitReachedNotificationSent: false,
  },

  updateUserState: (userLimit: number, userRemaining: number) => {
    if (userLimit === null || userRemaining === null) {
      return;
    }

    const { limitReachedNotificationSent, limitAlmostReachedNotificationSent } = apiStore.getState().userRecord;

    const upgraded = meStore.getState().user?.upgraded;

    set((state) => ({
      userRecord: {
        ...state.userRecord,
        limit: userLimit,
        remaining: userRemaining,
      },
    }));

    if (userRemaining <= 0 && !limitReachedNotificationSent) {
      sendLimitReachedNotification('Your personal workspace', upgraded);

      set((state) => ({
        userRecord: {
          ...state.userRecord,
          limitReachedNotificationSent: true,
        },
      }));
    } else if (userRemaining <= userLimit * 0.2 && !limitAlmostReachedNotificationSent) {
      sendLimitAlmostReachedNotification('Your personal workspace', upgraded);

      set((state) => ({
        userRecord: {
          ...state.userRecord,
          limitAlmostReachedNotificationSent: true,
        },
      }));
    }

    const limitReached = userRemaining <= 0;
    updateStatusbarItem('Your personal workspace', limitReached, upgraded);
  },

  teamRecordsById: {},
  updateTeamUsageLimitRecord: (teamId: string, limit: number, remaining: number) => {
    set((state) => ({
      teamRecordsById: {
        ...state.teamRecordsById,
        [teamId]: {
          limit,
          remaining,
          limitAlmostReachedNotificationSent: false,
          limitReachedNotificationSent: false,
        },
      },
    }));

    const { limitReachedNotificationSent, limitAlmostReachedNotificationSent } =
      apiStore.getState().teamRecordsById[teamId];

    const team = meStore.getState().user?.teams?.find((team) => team.id === teamId);
    const upgraded = team?.upgraded;
    const workspaceName = team?.name || 'Team workspace';
    const limitReached = remaining <= 0;

    if (remaining <= 0 && !limitReachedNotificationSent) {
      sendLimitReachedNotification(workspaceName, upgraded);
      set((state) => ({
        teamRecordsById: {
          ...state.teamRecordsById,
          [teamId]: {
            ...state.teamRecordsById[teamId],
            limitReachedNotificationSent: true,
          },
        },
      }));
    } else if (remaining <= limit * 0.2 && !limitAlmostReachedNotificationSent) {
      sendLimitAlmostReachedNotification(workspaceName, upgraded);
    }

    updateStatusbarItem(workspaceName, limitReached, upgraded);
  },
}));

export function useApiStore(): APIUsageState;
export function useApiStore<T>(selector: (state: APIUsageState) => T, equals?: (a: T, b: T) => boolean): T;
export function useApiStore<T>(selector?: (state: APIUsageState) => T, equals?: (a: T, b: T) => boolean) {
  return useStore(apiStore, selector!, equals);
}

const updateUsageLimit = (response: AxiosResponse) => {
  const limit = parseInt(response.headers['x-ratelimit-userlimit'] as string, 10);
  const remaining = parseInt(response.headers['x-ratelimit-userremaining'] as string, 10);

  if (isNaN(limit) || isNaN(remaining)) {
    hideStatusbarItem();
  } else {
    // scope: 'user' | 'team', targetId: string
    const scope = response.headers['x-target-scope'] as string;
    const targetId = response.headers['x-target-id'] as string;

    switch (scope) {
      case 'team':
        apiStore.getState().updateTeamUsageLimitRecord(targetId, limit, remaining);
        break;
      case 'user':
      default:
        apiStore.getState().updateUserState(limit, remaining);
        break;
    }
  }
};

export async function recordUsage<T>(promise: Promise<AxiosResponse<T>>): Promise<T> {
  try {
    const response = await promise;
    updateUsageLimit(response);

    return response.data;
  } catch (error) {
    if (error.response) {
      updateUsageLimit(error.response);

      const limitStr = error.response.headers['x-ratelimit-userlimit'];

      if (!limitStr) {
        vscode.window.showErrorMessage('You are making requests too quickly. Please slow down.', 'Got it');
      }
    }

    throw error;
  }
}
