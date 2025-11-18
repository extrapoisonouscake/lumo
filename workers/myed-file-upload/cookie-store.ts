/**
 * Cloudflare Worker-compatible cookie store
 * Implements the same interface as Next.js cookies() API
 */

// Cookie interface matching Next.js ResponseCookie format
export interface Cookie {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

// Cookie store interface matching Next.js cookies API
// This matches the interface from @edge-runtime/cookies ResponseCookies
export interface CookieStore {
  get(...args: [key: string] | [options: Cookie]): Cookie | undefined;
  getAll(...args: [key: string] | [options: Cookie] | []): Cookie[];
  has(name: string): boolean;
  set(
    name: string,
    value: string,
    options?: Partial<Omit<Cookie, "name" | "value">>
  ): this;
  set(options: Cookie): this;
  delete(name: string): this;
}

/**
 * Parse cookies from Cookie header string
 */
function parseCookieHeader(cookieHeader: string | null): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  cookieHeader.split(";").forEach((cookie) => {
    const trimmedCookie = cookie.trim();
    const equalIndex = trimmedCookie.indexOf("=");
    if (equalIndex > 0) {
      const name = trimmedCookie.substring(0, equalIndex).trim();
      const value = trimmedCookie.substring(equalIndex + 1).trim();
      // Decode the cookie value (cookies are URL-encoded)
      try {
        cookies.set(name, decodeURIComponent(value));
      } catch {
        // If decoding fails, use raw value
        cookies.set(name, value);
      }
    }
  });

  return cookies;
}

/**
 * Create a Worker-compatible cookie store from Request headers
 */
export function createCookieStore(request: Request): CookieStore {
  const cookieHeader = request.headers.get("Cookie");
  return new InternalCookieStore(cookieHeader);
}

/**
 * Convert cookie store to Set-Cookie headers for Response
 */
export function getSetCookieHeaders(cookieStore: CookieStore): string[] {
  const headers: string[] = [];
  const allCookies = cookieStore.getAll();

  for (const cookie of allCookies) {
    // Skip cookies that are being deleted
    if (cookie.maxAge === 0 || cookie.expires?.getTime() === 0) {
      continue;
    }

    let header = `${cookie.name}=${encodeURIComponent(cookie.value)}`;

    if (cookie.path) header += `; Path=${cookie.path}`;
    if (cookie.domain) header += `; Domain=${cookie.domain}`;
    if (cookie.maxAge !== undefined) header += `; Max-Age=${cookie.maxAge}`;
    if (cookie.expires) {
      header += `; Expires=${cookie.expires.toUTCString()}`;
    }
    if (cookie.httpOnly) header += `; HttpOnly`;
    if (cookie.secure) header += `; Secure`;
    if (cookie.sameSite) header += `; SameSite=${cookie.sameSite}`;

    headers.push(header);
  }

  return headers;
}

/**
 * Internal cookie store that tracks both incoming and outgoing cookies
 */
class InternalCookieStore implements CookieStore {
  private incomingCookies: Map<string, string>;
  private responseCookies: Map<string, Cookie>;

  constructor(cookieHeader: string | null) {
    this.incomingCookies = parseCookieHeader(cookieHeader);
    this.responseCookies = new Map();
  }

  get(...args: [key: string] | [options: Cookie]): Cookie | undefined {
    let name: string;
    if (typeof args[0] === "string") {
      name = args[0];
    } else if (args[0]?.name) {
      name = args[0].name;
    } else {
      return undefined;
    }

    // Check if cookie was set in this request (response cookies take precedence)
    if (this.responseCookies.has(name)) {
      return this.responseCookies.get(name);
    }
    // Check incoming cookies
    const value = this.incomingCookies.get(name);
    if (value !== undefined) {
      return {
        name,
        value,
      };
    }
    return undefined;
  }

  getAll(...args: [key: string] | [options: Cookie] | []): Cookie[] {
    if (args.length === 0) {
      // Return all cookies (incoming + response)
      const all: Cookie[] = [];
      this.incomingCookies.forEach((value, name) => {
        // Only include if not overridden by response cookie
        if (!this.responseCookies.has(name)) {
          all.push({ name, value });
        }
      });
      this.responseCookies.forEach((cookie) => {
        all.push(cookie);
      });
      return all;
    }

    // Get specific cookie(s)
    const arg = args[0];
    if (typeof arg === "string") {
      const cookie = this.get(arg);
      return cookie ? [cookie] : [];
    } else if (arg?.name) {
      const cookie = this.get(arg);
      return cookie ? [cookie] : [];
    }

    return [];
  }

  has(name: string): boolean {
    return this.incomingCookies.has(name) || this.responseCookies.has(name);
  }

  set(
    nameOrOptions: string | Cookie,
    value?: string,
    options?: Partial<Omit<Cookie, "name" | "value">>
  ): this {
    let name: string;
    let cookieValue: string;
    let cookieOptions: Partial<Omit<Cookie, "name" | "value">> = {};

    if (typeof nameOrOptions === "string") {
      name = nameOrOptions;
      cookieValue = value!;
      cookieOptions = options || {};
    } else {
      name = nameOrOptions.name;
      cookieValue = nameOrOptions.value;
      const { name: _, value: __, ...rest } = nameOrOptions;
      cookieOptions = rest;
    }

    this.responseCookies.set(name, {
      name,
      value: cookieValue,
      ...cookieOptions,
    });

    return this;
  }

  delete(name: string): this {
    // Mark cookie for deletion (set with empty value and past expiry)
    this.responseCookies.set(name, {
      name,
      value: "",
      maxAge: 0,
      expires: new Date(0),
    });

    return this;
  }

  getSetCookieHeaders(): string[] {
    return getSetCookieHeaders(this);
  }
  get size(): number {
    return this.responseCookies.size;
  }
}
