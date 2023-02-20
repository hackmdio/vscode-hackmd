import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

const getStatusbarItem = () => {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
  }

  return statusBarItem;
};

export function hideStatusbarItem() {
  if (!statusBarItem) {
    return;
  }

  statusBarItem.hide();
}

function baseSendLimitNotification(upgraded: boolean, message: string) {
  const contactSupport = 'Contact Support';
  const upgradeNow = 'Upgrade now';
  const primaryAction = upgraded ? contactSupport : upgradeNow;

  return vscode.window
    .showWarningMessage(
      message,
      {},
      {
        title: primaryAction,
      },
      {
        title: 'Close',
      }
    )
    .then((selection) => {
      switch (selection?.title) {
        case contactSupport:
          vscode.env.openExternal(vscode.Uri.parse('mailto:support@hackmd.io'));
          break;
        case upgradeNow:
          vscode.env.openExternal(vscode.Uri.parse('https://hackmd.io/settings#api'));
          break;
        default:
          break;
      }
    });
}

export function sendLimitAlmostReachedNotification(workspaceName: string, upgraded: boolean) {
  const message = upgraded
    ? `You are about to use up the API calls of ${workspaceName}. You will not be able to update notes or refresh note lists afterward. Please contact us if you'd need to increase the limit temporarily.`
    : `You are about to use up the API calls of ${workspaceName}. You will not be able to update notes or refresh note lists afterward. Please upgrade to increase it.`;

  return baseSendLimitNotification(upgraded, message);
}

export function sendLimitReachedNotification(workspaceName: string, upgraded: boolean) {
  const message = upgraded
    ? `You cannot update notes or refresh note lists because you have used up the API calls of ${workspaceName}. Please contact us if you need to temporarily increase the limit.`
    : `You cannot update notes or refresh note lists because you have used up the API calls of ${workspaceName}. Please upgrade to increase it.`;

  return baseSendLimitNotification(upgraded, message);
}

export function updateStatusbarItem(workspaceName: string, reached: boolean, upgraded: boolean) {
  const statusBarItem = getStatusbarItem();

  const text = reached ? '$(warning) Reaching API limit' : '$(wand) Reached limit';

  const tooltip = reached
    ? upgraded
      ? `${workspaceName} has run out of API calls. Contact us if you need to increase the limit.`
      : `${workspaceName} has run out API calls. Please upgrade to increase the limit.`
    : `${workspaceName} is running out of API calls.`;

  statusBarItem.text = text;
  statusBarItem.tooltip = new vscode.MarkdownString(tooltip);
  statusBarItem.command = 'HackMD.upgrade';

  statusBarItem.show();
}
