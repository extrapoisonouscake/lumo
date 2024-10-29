import { cookies, headers } from "next/headers";
import {
  MYED_AUTHENTICATION_COOKIES_NAMES,
  MYED_ENDPOINTS,
} from "../constants/myed";
import { getEndpointUrl } from "../helpers/getEndpointUrl";
import { getFullCookieName } from "../helpers/getFullCookieName";
const USER_AGENT_FALLBACK =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
export async function fetchMyEdPageHTML(endpoint: keyof typeof MYED_ENDPOINTS) {
  const cookieStore = cookies();
  const userAgent = headers().get("User-Agent") || USER_AGENT_FALLBACK;
  const myEdCookies = MYED_AUTHENTICATION_COOKIES_NAMES.map(
    (name) =>
      `${name}=${cookieStore.get(getFullCookieName(name))?.value || "aspen"}`
  ).join("; ");
  const response = await fetch(getEndpointUrl(endpoint), {
    headers: {
      Cookie: myEdCookies,
      "User-Agent": userAgent,
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
