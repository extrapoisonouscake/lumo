import {
  FlatParsingRouteStep,
  MYED_AUTHENTICATION_COOKIES_NAMES,
  MYED_HTML_TOKEN_INPUT_NAME,
} from "@/constants/myed";
import { getFullMyEdUrl } from "@/helpers/getFullMyEdURL";
import { headers } from "next/headers";
import "server-only";
import { clientQueueManager } from "./requests-queue";

const USER_AGENT_FALLBACK =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
export type SendMyEdRequestParameters = {
  step: FlatParsingRouteStep;
  session: string;
  authCookies: Record<
    (typeof MYED_AUTHENTICATION_COOKIES_NAMES)[number],
    string | undefined
  >;
} & (
  | { requestGroup?: never; isLastRequest?: never }
  | { requestGroup: string; isLastRequest: boolean }
);
const getUserAgent = () => {
  const userAgent = headers().get("User-Agent") || USER_AGENT_FALLBACK;
  return userAgent;
};
export async function sendMyEdRequest({
  authCookies,
  step,
  session,
  isLastRequest,
  requestGroup,
}: SendMyEdRequestParameters) {
  const cookiesString = MYED_AUTHENTICATION_COOKIES_NAMES.map(
    (name) => `${name}=${authCookies[name] || "aspen"}`
  ).join("; ");
  const userAgent = getUserAgent();
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
  let params: RequestInit = { method: step.method, headers: initHeaders };
  if (step.method === "POST") {
    params = {
      ...params,

      headers: {
        ...params.headers,
        "Content-Type": step.contentType,
      },
    };
    if (step.contentType === "application/x-www-form-urlencoded") {
      params.body = new URLSearchParams({
        ...step.body,
        [MYED_HTML_TOKEN_INPUT_NAME]: step.htmlToken,
      });
    } else if (step.contentType === "form-data") {
      const formData = new FormData();
      for (const [key, value] of Object.entries(step.body)) {
        formData.append(key, value);
      }
      formData.append(MYED_HTML_TOKEN_INPUT_NAME, step.htmlToken);
      params.body = formData;
    }
  }
  const args: [string, RequestInit] = [getFullMyEdUrl(step.path), params];

  const queue = clientQueueManager.getQueue(session);

  const response = await queue.enqueue(
    () => fetch(...args),
    requestGroup,
    isLastRequest
  );
  return response;
}
