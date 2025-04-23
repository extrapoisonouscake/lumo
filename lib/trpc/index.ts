import { router } from "./base";
import { authRouter } from "./routes/auth";
import { scheduleRouter } from "./routes/schedule";
import { schoolSpecificRouter } from "./routes/school-specific";
import { subjectsRouter } from "./routes/subjects";
import { userRouter } from "./routes/user";

export type AppRouter = typeof appRouter;
export const appRouter = router({
  auth: authRouter,
  schoolSpecific: schoolSpecificRouter,
  user: userRouter,
  schedule: scheduleRouter,
  subjects: subjectsRouter,
});
