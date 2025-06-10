import {
  AUTH_COOKIES_NAMES,
  COOKIE_MAX_AGE,
  shouldSecureCookies,
} from "@/constants/auth";
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
type AuthCookieName =
  (typeof AUTH_COOKIES_NAMES)[keyof typeof AUTH_COOKIES_NAMES];
export class MyEdCookieStore {
  private store: PlainCookieStore;

  private constructor(store: PlainCookieStore) {
    this.store = store;
  }

  static async create(plainStore?: PlainCookieStore): Promise<MyEdCookieStore> {
    const store = plainStore || (await cookies());
    return new MyEdCookieStore(store);
  }

  get = (name: AuthCookieName): ReturnType<PlainCookieStore["get"]> => {
    const rawValue = this.store.get(getFullCookieName(name));
    if (rawValue) {
      try {
        return {
          ...rawValue,
          value: encryption.decrypt(rawValue.value),
        };
      } catch {
        return undefined;
      }
    } else {
      return undefined;
    }
  };
  has = (name: AuthCookieName): ReturnType<PlainCookieStore["has"]> => {
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
    try {
      return this.store.getAll(...props).map((cookie) => ({
        ...cookie,
        value: encryption.decrypt(cookie.value),
      }));
    } catch {
      return [];
    }
  };
  delete: PlainCookieStore["delete"] = (name: string) => {
    return this.store.delete(getFullCookieName(name));
  };
  isMyEdCookieStore = true;
}
