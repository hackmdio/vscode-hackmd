import { connectToDevTools as connect } from 'react-devtools-core';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

export function connectToDevTools() {
  connect({
    websocket: new W3CWebSocket('ws://localhost:8097'),
  });
}
