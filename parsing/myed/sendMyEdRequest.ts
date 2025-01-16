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
  session?: string;
  isRestRequest: boolean
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
  isRestRequest
}: SendMyEdRequestParameters) {
  const cookiesString = MYED_AUTHENTICATION_COOKIES_NAMES.map(
    (name) => `${name}=${authCookies[name] || "aspen"}`
  ).join("; ");
  const userAgent = getUserAgent();
  const initHeaders = {
    Cookie: cookiesString,
    "User-Agent": userAgent,

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

  }


  if (step.body) {

    if (step.contentType === "application/x-www-form-urlencoded" || step.method === 'GET') {
      const queryString = new URLSearchParams({
        ...step.body,
        ...(step.htmlToken ? { [MYED_HTML_TOKEN_INPUT_NAME]: step.htmlToken } : {})
      });
      if (step.contentType === "application/x-www-form-urlencoded") {
        params.body = queryString
      } else {
        step.path += `?${queryString}`
        step.body = undefined
      }
    } else if (step.contentType === "form-data") {
      const formData = new FormData();
      for (const [key, value] of Object.entries(step.body)) {
        formData.append(key, value);
      }
      formData.append(MYED_HTML_TOKEN_INPUT_NAME, step.htmlToken);
      params.body = formData;
    }
  }
  console.log({ step })
  const args: [string, RequestInit] = [getFullMyEdUrl(step.path, isRestRequest), params];
  let response: Response
  const executeRequest = () => fetch(...args)
  if (session) {
    const queue = clientQueueManager.getQueue(session);

    response = await queue.enqueue(
      executeRequest,
      requestGroup,
      isLastRequest
    );
  } else {
    response = await executeRequest()
  }
  return response;
}
