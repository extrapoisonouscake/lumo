import { COOKIE_MAX_AGE, shouldSecureCookies } from "@/constants/auth";
import { encryption } from "@/lib/encryption";
import {
  ResponseCookie,
  ResponseCookies,
} from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import "server-only";
import { getFullCookieName } from "./getFullCookieName";
export const cookieDefaultOptions: Partial<ResponseCookie> = {
  secure: shouldSecureCookies,
  maxAge: COOKIE_MAX_AGE,
  httpOnly: true,
};

export type PlainCookieStore =
  | Awaited<ReturnType<typeof cookies>>
  | ResponseCookies;
export class MyEdCookieStore {
  private store: PlainCookieStore;

  private constructor(store: PlainCookieStore) {
    this.store = store;
  }

  static async create(plainStore?: PlainCookieStore): Promise<MyEdCookieStore> {
    const store = plainStore || (await cookies());
    return new MyEdCookieStore(store);
  }

  get: PlainCookieStore["get"] = (name: string) => {
    const rawValue = this.store.get(getFullCookieName(name));
    if (rawValue) {
      return {
        ...rawValue,
        value: encryption.decrypt(rawValue.value),
      };
    } else {
      return undefined;
    }
  };
  has: PlainCookieStore["has"] = (name: string) => {
    return this.store.has(getFullCookieName(name));
  };
  set: PlainCookieStore["set"] = (...props) => {
    if (typeof props[0] === "object") {
      const options = props[0];

      props[0] = {
        ...cookieDefaultOptions,
        ...options,
        name: getFullCookieName(options.name),
        value: encryption.encrypt(options.value),
      };
    } else {
      props[0] = getFullCookieName(props[0]);
      const value = props[1];
      if (value) {
        props[1] = encryption.encrypt(value);
      }
      if (props[2]) {
        const options = props[2];
        props[2] = {
          ...cookieDefaultOptions,
          ...options,
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
    return this.store.getAll(...props).map((cookie) => ({
      ...cookie,
      value: encryption.decrypt(cookie.value),
    }));
  };
  delete: PlainCookieStore["delete"] = (name: string) => {
    return this.store.delete(getFullCookieName(name));
  };
  isMyEdCookieStore = true;
}
