import { router } from "../../base";
import { schoolSpecificRouter } from "./school-specific";
import { settingsRouter } from "./settings";

export const coreRouter = router({
  schoolSpecific: schoolSpecificRouter,
  settings: settingsRouter,
});
