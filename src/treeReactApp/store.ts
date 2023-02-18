import * as vscode from 'vscode';

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

  // Whether the notification has been sent in current session
  limitReachedNotificationSent: boolean;

  // Whether the notification has been sent in current session
  // Will be sent if only 20% of the limit is left
  limitAlmostReachedNotificationSent: boolean;

  setLimitReachedNotificationSent: (limitReachedNotificationSent: boolean) => void;
  setLimitAlmostReachedNotificationSent: (limitAlmostReachedNotificationSent: boolean) => void;

  // Weather the rate limit has been hit
  rateLimitHit: boolean;
  setRateLimitHit: (rateLimitHit: boolean) => void;
};
export const apiStore = createStore<APIUsageState>()((set) => ({
  userLimit: null,
  userRemaining: null,
  updateState: (userLimit: number, userRemaining: number) => set({ userLimit, userRemaining }),
  limitReachedNotificationSent: false,
  limitAlmostReachedNotificationSent: false,
  setLimitReachedNotificationSent: (limitReachedNotificationSent: boolean) => set({ limitReachedNotificationSent }),
  setLimitAlmostReachedNotificationSent: (limitAlmostReachedNotificationSent: boolean) =>
    set({ limitAlmostReachedNotificationSent }),
  rateLimitHit: false,
  setRateLimitHit: (rateLimitHit: boolean) => set({ rateLimitHit }),
}));

export function useApiStore(): APIUsageState;
export function useApiStore<T>(selector: (state: APIUsageState) => T, equals?: (a: T, b: T) => boolean): T;
export function useApiStore<T>(selector?: (state: APIUsageState) => T, equals?: (a: T, b: T) => boolean) {
  return useStore(apiStore, selector!, equals);
}

const updateUsageLimit = (response: AxiosResponse) => {
  const userLimit = parseInt(response.headers['x-ratelimit-userlimit'] as string, 10);
  const userRemaining = parseInt(response.headers['x-ratelimit-userremaining'] as string, 10);

  if (isNaN(userLimit) || isNaN(userRemaining)) {
    // is a rate limit issue
    apiStore.getState().setRateLimitHit(true);
  } else {
    apiStore.getState().setRateLimitHit(false);
    apiStore.getState().updateState(userLimit, userRemaining);
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
    }

    throw error;
  }
}

let statusBarItem: vscode.StatusBarItem;

apiStore.subscribe((state) => {
  const {
    userLimit,
    userRemaining,
    limitAlmostReachedNotificationSent,
    setLimitAlmostReachedNotificationSent,
    setLimitReachedNotificationSent,
    limitReachedNotificationSent,
    rateLimitHit,
  } = state;

  if (rateLimitHit) {
    vscode.window.showErrorMessage('You have reached the rate limit. Please try again later.');
    return;
  }

  if (userRemaining === 0) {
    if (!statusBarItem) {
      statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
    }

    statusBarItem.tooltip = new vscode.MarkdownString(
      `You have reached the API limit. Please upgrade your plan to continue using HackMD Extension. [Upgrade now](https://hackmd.io/settings#api)`
    );

    statusBarItem.text = '$(warning) API Limit';
    statusBarItem.command = 'hackmdio.upgrade';
    statusBarItem.show();

    if (!limitReachedNotificationSent) {
      vscode.window
        .showWarningMessage(
          'You cannot update notes or refresh note lists because you have used up the API calls. Please upgrade to increase it.',
          {},
          {
            title: 'Upgrade now',
          },
          {
            title: 'Close',
          }
        )
        .then((selection) => {
          if (selection?.title === 'Upgrade now') {
            vscode.env.openExternal(vscode.Uri.parse('https://hackmd.io/settings#api'));
          }
        });

      setLimitReachedNotificationSent(true);
    }
  } else if (userLimit && userRemaining / userLimit < 0.2) {
    // over 80% of limit show warning
    if (!statusBarItem) {
      statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
    }

    statusBarItem.text = '$(wand) Get API Limit';
    statusBarItem.tooltip = new vscode.MarkdownString(
      `You are about to use up the API calls on the current plan. You will not be able to update notes or refresh note lists afterward. Please upgrade to increase it. [Upgrade now](https://hackmd.io/settings#api)`
    );
    statusBarItem.command = 'HackMD.upgrade';
    statusBarItem.show();

    if (!limitAlmostReachedNotificationSent) {
      vscode.window
        .showWarningMessage(
          'You are about to use up the API calls on the current plan. You will not be able to update notes or refresh note lists afterward. Please upgrade to increase it.',
          {},
          {
            title: 'Upgrade now',
          },
          {
            title: 'Close',
          }
        )
        .then((selection) => {
          if (selection?.title === 'Upgrade now') {
            vscode.env.openExternal(vscode.Uri.parse('https://hackmd.io/settings#api'));
          }
        });

      setLimitAlmostReachedNotificationSent(true);
    }
  } else {
    statusBarItem?.hide();
  }
});

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
