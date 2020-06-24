import { observable } from "mobx";

export interface Store {
    history: Array<any>;
    isLogin: boolean;
}

export const store: Store = observable({
    history: [{}],
    isLogin: false
});