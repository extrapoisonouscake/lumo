import { createCallerFactory, router } from "./base";
import { coreRouter } from "./routes/core";
import { myedRouter } from "./routes/myed";

export type AppRouter = typeof appRouter;
export const appRouter = router({
  myed: myedRouter,
  core: coreRouter,
});
export const createCaller = createCallerFactory(appRouter);
