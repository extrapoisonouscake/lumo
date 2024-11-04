"use server";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { MyEdFetchEndpoints } from "@/types/myed";
import { cookies } from "next/headers";
import { getAuthCookies } from "../helpers/getAuthCookies";
import { sendMyEdRequest } from "./sendMyEdRequest";

export async function fetchMyEdPageHTML(endpoint: MyEdFetchEndpoints) {
  const cookieStore = new MyEdCookieStore(cookies());
  let response = await sendMyEdRequest(endpoint, getAuthCookies(cookieStore));
  if (!response.ok) {
    throw response;
  }
  const html = await response.text();
  return html;
}
