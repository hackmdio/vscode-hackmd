import { checkLogin } from '../utils';

import { API } from './../api';

import { store } from '.';

export async function initializeStorage() {
  // store.history = store.history = (await API.getHistory()).history.reverse();
  // store.isLogin = await checkLogin();
}
