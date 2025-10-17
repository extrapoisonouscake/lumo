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
import { cookies, headers } from "next/headers";
import "server-only";
import { getFullCookieName } from "./getFullCookieName";
export const cookieDefaultOptions: Partial<ResponseCookie> = {
  secure: shouldSecureCookies,
  maxAge: COOKIE_MAX_AGE,
  httpOnly: true,
  sameSite: "strict",
};

export type PlainCookieStore =
  | Awaited<ReturnType<typeof cookies>>
  | ResponseCookies;
type AuthCookieName =
  (typeof AUTH_COOKIES_NAMES)[keyof typeof AUTH_COOKIES_NAMES];
export class MyEdCookieStore {
  private store: PlainCookieStore;
  private cookieOptions: Partial<ResponseCookie>;

  private constructor(store: PlainCookieStore, isMobileApp?: boolean) {
    this.store = store;
    // Set cookie options based on platform (checked once at creation)
    this.cookieOptions = {
      ...cookieDefaultOptions,
    };
    if (isMobileApp) {
      this.cookieOptions.httpOnly = false;
    }
  }

  static async create(plainStore?: PlainCookieStore): Promise<MyEdCookieStore> {
    const store =
      plainStore && !(plainStore instanceof MyEdCookieStore)
        ? plainStore
        : await cookies();

    // Check platform once during creation
    const origin = (await headers()).get("origin");
    const isCapacitorOrigin = origin?.startsWith("capacitor://");
    console.log({ origin });
    return new MyEdCookieStore(store, isCapacitorOrigin);
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
    if (typeof props[0] === "object" && props[0] !== null) {
      const options = props[0];

      props[0] = {
        ...this.cookieOptions,
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
          ...this.cookieOptions,
          ...options,
        };
      } else {
        props.push(this.cookieOptions as any);
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
