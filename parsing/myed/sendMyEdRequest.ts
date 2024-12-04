import {
  EndpointReturnTypes,
  MYED_AUTHENTICATION_COOKIES_NAMES,
} from "@/constants/myed";
import { headers } from "next/headers";
import "server-only";
import { clientQueueManager } from "./requests-queue";

const USER_AGENT_FALLBACK =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

export async function sendMyEdRequest(
  urlOrParams: EndpointReturnTypes,
  session: string,
  authCookies: Record<
    (typeof MYED_AUTHENTICATION_COOKIES_NAMES)[number],
    string | undefined
  >
) {
  const cookiesString = MYED_AUTHENTICATION_COOKIES_NAMES.map(
    (name) => `${name}=${authCookies[name] || "aspen"}`
  ).join("; ");
  const userAgent = headers().get("User-Agent") || USER_AGENT_FALLBACK;
  const initHeaders = {
    Cookie: cookiesString,
    "User-Agent": userAgent,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-CA,en-US;q=0.9,en;q=0.8",
    Connection: "keep-alive",

    Priority: "u=0, i",
    Referer: "https://myeducation.gov.bc.ca/aspen/home.do",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
  };
  let params: [string, RequestInit];
  if (typeof urlOrParams === "string") {
    params = [
      urlOrParams,
      {
        headers: initHeaders,
      },
    ];
  } else {
    const fullHeaders = { ...initHeaders, ...urlOrParams[1]?.headers };
    params = [
      urlOrParams[0],
      {
        ...urlOrParams[1],
        headers: fullHeaders,
      },
    ];
  }
  const queue = clientQueueManager.getQueue(session);
  const response = await queue.enqueue(() => fetch(...params), params[0]);

  return response;
}
