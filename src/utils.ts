import { connectToDevTools } from 'react-devtools-core';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

import { API } from './api';

export const checkLogin = async () => {
  try {
    const user = await API.getMe();
    return !!user;
  } catch (e) {
    return false;
  }
};

export function connect() {
  connectToDevTools({
    websocket: new W3CWebSocket('ws://localhost:8097'),
  });
}
