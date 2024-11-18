import {
  MYED_AUTHENTICATION_COOKIES_NAMES,
  MYED_ENDPOINTS,
} from "@/constants/myed";
import { getEndpointUrl } from "@/helpers/getEndpointUrl";
import { headers } from "next/headers";
import "server-only";

const USER_AGENT_FALLBACK =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
export async function sendMyEdRequest(
  endpoint: keyof typeof MYED_ENDPOINTS,
  authCookies: Record<
    (typeof MYED_AUTHENTICATION_COOKIES_NAMES)[number],
    string | undefined
  >,
  params?: Record<string, string>
) {
  const cookiesString = MYED_AUTHENTICATION_COOKIES_NAMES.map(
    (name) => `${name}=${authCookies[name] || "aspen"}`
  ).join("; ");
  const userAgent = headers().get("User-Agent") || USER_AGENT_FALLBACK;
const url = getEndpointUrl(endpoint, params)
console.log({url})
  const response = await fetch(url, {
    headers: {
      Cookie: cookiesString,
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
  return response;
}
