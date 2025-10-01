import { getAuthCookies } from "@/helpers/getAuthCookies";
import { hashString } from "@/helpers/hashString";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies, headers } from "next/headers";
type AuthenticatedTRPCContext = {
  studentId: string;
  studentDatabaseId: string;
  credentials: { username: string; password: string };
  tokens?: string;
};
export const createTRPCContext = async () => {
  const store = await cookies();
  const cookieStore = await MyEdCookieStore.create(store);
  let studentDatabaseId, username, password, tokens, studentId;
  try {
    studentId = cookieStore.get("studentId")?.value;
    if (studentId) {
      studentDatabaseId = hashString(studentId);
    }
    const credentials = cookieStore.get("credentials")?.value;
    [username, password] =
      credentials?.split("|").map(decodeURIComponent) ?? [];
    tokens = cookieStore.get("tokens")?.value;
  } catch {}
  const ip = ((await headers()).get("x-forwarded-for") ?? "127.0.0.1").split(
    ","
  )[0];
  const getMyEdWithParameters = getMyEd(
    tokens
      ? {
          authCookies: getAuthCookies(cookieStore),
          studentId: studentId!,
        }
      : undefined
  );
  return {
    studentId,
    studentDatabaseId,
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
  return !!ctx.studentId;
}
