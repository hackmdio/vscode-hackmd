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
  const { W3CWebSocket } = require('websocket');
  const { connectToDevTools } = require('react-devtools-core');

  connectToDevTools({
    websocket: new W3CWebSocket('ws://localhost:8097'),
  });
}
