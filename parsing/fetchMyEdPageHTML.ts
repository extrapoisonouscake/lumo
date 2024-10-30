import { MyEdCookieStore } from "@/helpers/getMyEdCookieStore";
import { authenticateUser } from "@/lib/auth/helpers";
import { MyEdFetchEndpoints } from "@/types/myed";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendMyEdRequest } from "./sendMyEdRequest";

export async function fetchMyEdPageHTML(endpoint: MyEdFetchEndpoints) {
  const cookieStore = new MyEdCookieStore(cookies());
  let response = await sendMyEdRequest(endpoint, cookieStore);
  if (!response.ok) {
    console.log("NOT OK");
    const username = cookieStore.get("username")?.value;
    const password = cookieStore.get("password")?.value;
    console.log(username, password);
    if (!username || !password) redirect("/login");
    try {
      await authenticateUser(username, password, cookieStore);
      response = await sendMyEdRequest(endpoint, cookieStore);
      if (!response.ok) throw new Error("Failed");
    } catch {
      redirect("/login");
    }
  }
  const html = await response.text();
  return html;
}
