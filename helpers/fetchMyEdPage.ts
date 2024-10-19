import { cookies } from "next/headers";
import UserAgent from "user-agents";
import {
  MYED_AUTHENTICATION_COOKIES_NAMES,
  MYED_ENDPOINTS,
} from "../constants/myed";
import { getEndpointUrl } from "./getEndpointUrl";
import { getFullCookieName } from "./getFullCookieName";

export async function fetchMyEdPage(endpoint: keyof typeof MYED_ENDPOINTS) {
  const cookieStore = cookies();

  const myEdCookies = MYED_AUTHENTICATION_COOKIES_NAMES.map(
    (name) =>
      `${name}=${cookieStore.get(getFullCookieName(name))?.value || "aspen"}`
  ).join("; ");
  const userAgent = new UserAgent({ deviceCategory: "desktop" });
  const response = await fetch(getEndpointUrl(endpoint), {
    headers: {
      Cookie: myEdCookies,
      "User-Agent": userAgent.toString(),
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-CA,en-US;q=0.9,en;q=0.8",
      Connection: "keep-alive",

      Priority: "u=0, i",
      Referer: "https://myeducation.gov.bc.ca/aspen/home.do",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
    },
  });
  const html = await response.text();
  if (!response.ok) throw response;
  return html;
}
