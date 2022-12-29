import { API } from './api';
import { store } from './store';

export const refreshLoginStatus = async () => {
  store.isLogin = await checkLogin();
};

export const checkLogin = async () => {
  try {
    const user = await API.getMe();
    return !!user;
  } catch (e) {
    return false;
  }
};
