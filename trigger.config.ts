import { syncVercelEnvVars } from "@trigger.dev/build/extensions/core";
import { defineConfig } from "@trigger.dev/sdk/v3";
export default defineConfig({
  project: "proj_ryavadsiwdamcljnpelz",
  runtime: "node",
  logLevel: "log",
  // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
  // You can override this on an individual task.
  // See https://trigger.dev/docs/runs/max-duration
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
  },
  dirs: ["trigger"],
  build: {
    // Add the syncVercelEnvVars build extension
    extensions: [syncVercelEnvVars()],
  },
});
