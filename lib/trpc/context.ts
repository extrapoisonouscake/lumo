import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { cookies, headers } from "next/headers";
type AuthenticatedTRPCContext = {
  isGuest: false;
  studentId: string;
  credentials: string; //temporary non-undefined
  tokens?: string;
};
export const createTRPCContext = async ({
  req,
}: FetchCreateContextFnOptions) => {
  const store = await cookies();
  const cookieStore = await MyEdCookieStore.create(store);
  const studentId = cookieStore.get("studentId")?.value;
  const credentials = cookieStore.get("credentials")?.value;
  const tokens = cookieStore.get("tokens")?.value;
  const isGuest = !!store.get("isGuest")?.value;
  const ip = ((await headers()).get("x-forwarded-for") ?? "127.0.0.1").split(
    ","
  )[0];
  return {
    isGuest,
    studentId,
    credentials,
    tokens,
    ip,
    cookieStore,
  } as { ip: string; cookieStore: MyEdCookieStore } & (
    | { isGuest: true }
    | AuthenticatedTRPCContext
  );
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
export function isAuthenticatedContext(
  ctx: TRPCContext
): ctx is TRPCContext & AuthenticatedTRPCContext {
  return !ctx.isGuest && !!ctx.studentId;
}
