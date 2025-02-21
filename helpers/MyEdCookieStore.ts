import { COOKIE_MAX_AGE, shouldSecureCookies } from "@/constants/auth";
import {
  ResponseCookie,
  ResponseCookies,
} from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import "server-only";
import { getFullCookieName } from "./getFullCookieName";
const cookieDefaultOptions: Partial<ResponseCookie> = {
  secure: shouldSecureCookies,
  maxAge: COOKIE_MAX_AGE,
  httpOnly: true,
};
export type PlainCookieStore = ReturnType<typeof cookies> | ResponseCookies;
export class MyEdCookieStore {
  store: PlainCookieStore;
  constructor(plainStore: PlainCookieStore = cookies()) {
    this.store = plainStore;
  }
  get: PlainCookieStore["get"] = (name: string) => {
    console.log(this.store.get);
    return this.store.get(getFullCookieName(name));
  };
  has: PlainCookieStore["has"] = (name: string) => {
    return this.store.has(getFullCookieName(name));
  };
  set: PlainCookieStore["set"] = (...props) => {
    if (typeof props[0] === "object") {
      props[0] = {
        ...cookieDefaultOptions,
        ...props[0],
        name: getFullCookieName(props[0].name),
      };
    } else {
      props[0] = getFullCookieName(props[0]);

      if (props[2]) {
        props[2] = {
          ...cookieDefaultOptions,
          ...props[2],
        };
      } else {
        props.push(cookieDefaultOptions as any);
      }
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
