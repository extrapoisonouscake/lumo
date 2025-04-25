import dayjs from "dayjs";
import Cookies from "js-cookie";
import { sha256 } from "./sha256";
interface RelatedApp {
  id?: string;
  url?: string;
  platform: string;
}
export async function isPWAInstalled() {
  if (!("getInstalledRelatedApps" in window.navigator)) return false;
  const relatedApps: RelatedApp[] = await (
    navigator as any
  ).getInstalledRelatedApps();
  return relatedApps.length > 0;
}
export const DEVICE_ID_COOKIE_NAME = "deviceId";
export function getDeviceId() {
  return Cookies.get(DEVICE_ID_COOKIE_NAME);
}
export async function setDeviceId(endpointURL: string) {
  const hash = await sha256(endpointURL);
  Cookies.set(DEVICE_ID_COOKIE_NAME, hash, {
    expires: dayjs().add(1, "year").toDate(),
  });
}
