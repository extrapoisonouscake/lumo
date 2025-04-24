import { hashString } from "@/helpers/hashString";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies, headers } from "next/headers";
type AuthenticatedTRPCContext = {
  isGuest: false;
  studentId: string;
  studentHashedId: string;
  credentials: string; //temporary non-undefined
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
  const tokens = cookieStore.get("tokens")?.value;
  const isGuest = !!store.get("isGuest")?.value;
  const ip = ((await headers()).get("x-forwarded-for") ?? "127.0.0.1").split(
    ","
  )[0];
  return {
    isGuest,
    studentId,
    studentHashedId,
    credentials,
    tokens,
    ip,
    authCookieStore: cookieStore,
    cookieStore: store,
  } as {
    ip: string;
    cookieStore: ReadonlyRequestCookies;
    authCookieStore: MyEdCookieStore;
  } & ({ isGuest: true } | AuthenticatedTRPCContext);
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
export function isAuthenticatedContext(
  ctx: TRPCContext
): ctx is TRPCContext & AuthenticatedTRPCContext {
  return !ctx.isGuest && !!ctx.studentId;
}
