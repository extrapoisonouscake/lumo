import { cookies } from "next/headers";
import "server-only";
import { getFullCookieName } from "./getFullCookieName";
type PlainStore = ReturnType<typeof cookies>;
export class MyEdCookieStore {
  store: PlainStore;
  constructor(plainStore: PlainStore) {
    this.store = plainStore;
  }
  get: PlainStore["get"] = (name: string) => {
    return this.store.get(getFullCookieName(name));
  };
  has: PlainStore["has"] = (name: string) => {
    return this.store.has(getFullCookieName(name));
  };
  set: PlainStore["set"] = (...props) => {
    if (typeof props[0] === "object") {
      props[0].name = getFullCookieName(props[0].name);
    } else {
      props[0] = getFullCookieName(props[0]);
    }
    return this.store.set(...props);
  };
  getAll: PlainStore["getAll"] = (...props: [name: string] | []) => {
    if (props[0]) {
      props[0] = getFullCookieName(props[0]);
    }
    return this.store.getAll(...props);
  };
  delete: PlainStore["delete"] = (name: string) => {
    return this.store.delete(getFullCookieName(name));
  };
}
