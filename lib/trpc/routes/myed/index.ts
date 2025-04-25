import { router } from "../../base";
import { authRouter } from "./auth";
import { scheduleRouter } from "./schedule";
import { subjectsRouter } from "./subjects";
import { userRouter } from "./user";

export const myedRouter = router({
  user: userRouter,
  schedule: scheduleRouter,
  subjects: subjectsRouter,
  auth: authRouter,
});
