import { appRouter } from "@/lib/trpc";
import { createTRPCContext } from "@/lib/trpc/context";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    onError: (opts) => {
      console.trace(opts.error);
    },
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
