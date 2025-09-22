import { isProduction } from "@/constants/core";
import apn from "@parse/node-apn";
const privateKey = Buffer.from(
  process.env.IOS_APN_PRIVATE_KEY!,
  "base64"
).toString("utf8");
const options = {
  token: {
    key: privateKey,
    keyId: process.env.IOS_APN_PRIVATE_KEY_ID!,
    teamId: process.env.APPLE_TEAM_ID!,
  },
  production: isProduction,
};

export const apnProvider = new apn.Provider(options);
