import { getAuthCookies } from "@/helpers/getAuthCookies";
import { hashString } from "@/helpers/hashString";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies, headers } from "next/headers";
type AuthenticatedTRPCContext = {
  isGuest: false;
  studentId: string;
  studentHashedId: string;
  credentials: { username: string; password: string };
  tokens?: string;
};
export const createTRPCContext = async () => {
  const store = await cookies();
  const cookieStore = await MyEdCookieStore.create(store);
  const studentId = cookieStore.get("studentId")?.value;
  let studentHashedId;
  if (studentId) {
    studentHashedId = hashString(studentId);
  }
  const credentials = cookieStore.get("credentials")?.value;
  const [username, password] =
    credentials?.split("|").map(decodeURIComponent) ?? [];
  const tokens = cookieStore.get("tokens")?.value;
  const isGuest = !!store.get("isGuest")?.value;
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
    isGuest,
    studentId,
    studentHashedId,
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
  } & ({ isGuest: true } | AuthenticatedTRPCContext);
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
export function isAuthenticatedContext(
  ctx: TRPCContext
): ctx is TRPCContext & AuthenticatedTRPCContext {
  return !ctx.isGuest && !!ctx.studentId;
}
