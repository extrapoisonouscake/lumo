import { router } from "../../base";
import { schoolSpecificRouter } from "./school-specific";
import { settingsRouter } from "./settings";
import { updatesRouter } from "./updates";

export const coreRouter = router({
  schoolSpecific: schoolSpecificRouter,
  settings: settingsRouter,
  updates: updatesRouter,
});
