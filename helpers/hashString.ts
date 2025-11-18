import { createHash } from "node:crypto";

export const hashString = (string: string) => {
  return createHash("sha256").update(string).digest("hex");
};
