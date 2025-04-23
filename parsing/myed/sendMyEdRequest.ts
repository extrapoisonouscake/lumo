import {
  FlatRouteStep,
  MYED_AUTHENTICATION_COOKIES_NAMES,
  MYED_HTML_TOKEN_INPUT_NAME,
} from "@/constants/myed";

import { headers } from "next/headers";
import "server-only";

import { fetchMyEd } from "@/instances/fetchMyEd";
import { clientQueueManager, PrioritizedRequestQueue } from "./requests-queue";

const USER_AGENT_FALLBACK =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
export type SendMyEdRequestParameters<
  Steps extends FlatRouteStep | FlatRouteStep[]
> = {
  step: Steps;

  authCookies: Record<
    (typeof MYED_AUTHENTICATION_COOKIES_NAMES)[number],
    string | undefined
  >;
  requestGroup?: string;
} & ({ session?: string } | { queue: PrioritizedRequestQueue });
const getUserAgent = async () => {
  const headersList = await headers();
  const userAgent = headersList.get("User-Agent") || USER_AGENT_FALLBACK;
  return userAgent;
};
export async function sendMyEdRequest<Steps extends FlatRouteStep[]>(
  params: SendMyEdRequestParameters<Steps>
): Promise<Response[]>;
export async function sendMyEdRequest<Steps extends FlatRouteStep>(
  params: SendMyEdRequestParameters<Steps>
): Promise<Response>;
export async function sendMyEdRequest<
  Steps extends FlatRouteStep | FlatRouteStep[]
>({
  authCookies,
  step: stepOrSteps,

  requestGroup,
  ...sessionOrQueue
}: SendMyEdRequestParameters<Steps>) {
  const isQueue = "queue" in sessionOrQueue;
  const isSession = !isQueue && sessionOrQueue.session;
  const isAuthenticated = isQueue || isSession;
  let cookiesString = "";
  if (isAuthenticated) {
    cookiesString = MYED_AUTHENTICATION_COOKIES_NAMES.map(
      (name) => `${name}=${authCookies[name] || "aspen"}`
    ).join("; ");
  }
  const userAgent = await getUserAgent();
  const initHeaders = {
    Cookie: cookiesString,
    "User-Agent": userAgent,
  };
  const argumentsArray: [string, RequestInit][] = [];
  const isMultipleSteps = Array.isArray(stepOrSteps);
  const stepsArray: FlatRouteStep[] = isMultipleSteps
    ? stepOrSteps
    : [stepOrSteps];
  for (const step of stepsArray) {
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
      if (
        step.contentType === "application/x-www-form-urlencoded" ||
        step.method === "GET"
      ) {
        const queryString = new URLSearchParams({
          ...removeNullableProperties(step.body),
          ...(step.htmlToken
            ? { [MYED_HTML_TOKEN_INPUT_NAME]: step.htmlToken }
            : {}),
        });
        if (step.contentType === "application/x-www-form-urlencoded") {
          params.body = queryString;
        } else {
          step.path += `?${queryString}`;
          step.body = undefined;
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
    const args: [string, RequestInit] = [step.path, params];
    argumentsArray.push(args);
  }

  const queue = isQueue
    ? sessionOrQueue.queue
    : isSession
    ? clientQueueManager.getQueue(sessionOrQueue.session as string)
    : undefined;
  const requestFunction = isMultipleSteps
    ? () => Promise.all(argumentsArray.map((args) => fetchMyEd(...args)))
    : () => fetchMyEd(...argumentsArray[0]);
  let response;
  if (queue) {
    response = await queue.enqueue<Response | Response[]>(
      requestFunction,
      requestGroup
    );
  } else {
    response = await requestFunction();
  }

  return response;
}
function removeNullableProperties<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== null && value !== undefined
    )
  ) as Partial<T>;
}
