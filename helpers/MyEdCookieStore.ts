import { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import "server-only";
import { getFullCookieName } from "./getFullCookieName";
export type PlainCookieStore = ReturnType<typeof cookies> | ResponseCookies;
export class MyEdCookieStore {
  store: PlainCookieStore;
  constructor(plainStore: PlainCookieStore) {
    this.store = plainStore;
  }
  get: PlainCookieStore["get"] = (name: string) => {
    return this.store.get(getFullCookieName(name));
  };
  has: PlainCookieStore["has"] = (name: string) => {
    return this.store.has(getFullCookieName(name));
  };
  set: PlainCookieStore["set"] = (...props) => {
    if (typeof props[0] === "object") {
      props[0].name = getFullCookieName(props[0].name);
    } else {
      props[0] = getFullCookieName(props[0]);
    }
    return this.store.set(...props);
  };
  getAll: PlainCookieStore["getAll"] = (...props: [name: string] | []) => {
    if (props[0]) {
      props[0] = getFullCookieName(props[0]);
    }
    return this.store.getAll(...props);
  };
  delete: PlainCookieStore["delete"] = (name: string) => {
    return this.store.delete(getFullCookieName(name));
  };
  isMyEdCookieStore = true;
}
