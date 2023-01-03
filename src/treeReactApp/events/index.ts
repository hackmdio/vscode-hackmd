import * as vscode from 'vscode';

import { useEffect } from 'react';

export const refreshHistoryEvent = new vscode.EventEmitter<void>();
export const refreshMyNotesEvent = new vscode.EventEmitter<void>();
export const refreshTeamNotesEvent = new vscode.EventEmitter<void>();

export const useEventEmitter = (event: vscode.EventEmitter<void>, cb: () => void) => {
  useEffect(() => {
    const disposable = event.event(cb);
    return () => {
      disposable.dispose();
    };
  }, [cb, event]);
};
