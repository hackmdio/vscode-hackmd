import { API } from './api';

export const checkLogin = async () => {
    return (await API.getMe()).status === 'ok';
};
