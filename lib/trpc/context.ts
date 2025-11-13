import { CookieMyEdUser, getAuthCookies } from "@/helpers/getAuthCookies";
import { hashString } from "@/helpers/hashString";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { UserRole } from "@/types/school";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies, headers } from "next/headers";
type AuthenticatedTRPCContext = {
  myedUser: CookieMyEdUser;
  userId: string;

  credentials: { username: string; password: string };
  tokens?: string;
} & (
  | {
      role: Exclude<UserRole, UserRole.Parent>;
      targetId?: never;
    }
  | {
      role: UserRole.Parent;
      targetId: string;
    }
);
export const createTRPCContext = async () => {
  const store = await cookies();

  const cookieStore = await MyEdCookieStore.create(store);

  let userId, username, password, tokens, myedUser, targetId;
  try {
    const myedUserString = cookieStore.get("user")?.value;
    myedUser = myedUserString ? JSON.parse(myedUserString) : undefined;
    if (myedUser) {
      userId = hashString(myedUser.id);
      targetId = cookieStore.get("targetId")?.value;
    }
    const credentials = cookieStore.get("credentials")?.value;
    [username, password] =
      credentials?.split("|").map(decodeURIComponent) ?? [];
    tokens = cookieStore.get("tokens")?.value;
  } catch (e) {
    console.error(e);
  }
  const ip = ((await headers()).get("x-forwarded-for") ?? "127.0.0.1").split(
    ","
  )[0];
  const getMyEdWithParameters = getMyEd(
    tokens
      ? {
          authCookies: getAuthCookies(cookieStore),
          myedUser,
          targetId,
        }
      : undefined
  );
  return {
    myedUser,
    userId,
    targetId,
    credentials: { username, password },
    tokens,
    ip,
    authCookieStore: cookieStore,
    cookieStore: store,
    getMyEd: getMyEdWithParameters,
  } as {
    ip: string;
    cookieStore: ReadonlyRequestCookies;
    authCookieStore: MyEdCookieStore;
    getMyEd: ReturnType<typeof getMyEd>;
  } & AuthenticatedTRPCContext;
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
export function isAuthenticatedContext(
  ctx: TRPCContext
): ctx is TRPCContext & AuthenticatedTRPCContext {
  return !!ctx.myedUser;
}
