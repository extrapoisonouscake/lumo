import { UTApi } from "uploadthing/server";
const { UPLOADTHING_APP_ID, UPLOADTHING_TOKEN } = process.env;
if (!UPLOADTHING_APP_ID || !UPLOADTHING_TOKEN)
  throw new Error("UPLOADTHING_APP_ID or UPLOADTHING_TOKEN is not set");
export const utapi = new UTApi({
  token: UPLOADTHING_TOKEN,
});

export const getUploadthingFileUrl = (fileID: string) =>
  `https://${UPLOADTHING_APP_ID}.ufs.sh/f/${fileID}`;
