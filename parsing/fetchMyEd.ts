import { getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { MyEdFetchEndpoints } from "@/types/myed";
import { cookies } from "next/headers";
import "server-only";
import { sendMyEdRequest } from "./sendMyEdRequest";
import { parseSubjects } from "./subjects";
const endpointToFunction = {
  subjects: parseSubjects,
} as const satisfies Record<MyEdFetchEndpoints, (html: string) => any>;
export async function fetchMyEd(endpoint: MyEdFetchEndpoints) {
  const cookieStore = new MyEdCookieStore(cookies());
  let response = await sendMyEdRequest(endpoint, getAuthCookies(cookieStore));
  if (!response.ok) {
    throw response;
  }
  const html = await response.text();
  return endpointToFunction[endpoint](html);
}
