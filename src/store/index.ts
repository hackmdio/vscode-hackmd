import { observable } from "mobx";

export interface Store {
    history: Array<any>
}

export const store: Store = observable({
    history: [{}]
});