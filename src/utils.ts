import { API } from './api';

export const checkLogin = async () => {
  try {
    const user = await API.getMe();
    return !!user;
  } catch (e) {
    return false;
  }
};
