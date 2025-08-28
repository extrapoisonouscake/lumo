import { MYED_DOMAIN } from "@/constants/myed";
import { convertObjectToCookieString } from "@/helpers/convertObjectToCookieString";
import { getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { MyEdBaseURLs } from "@/instances/fetchMyEd";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = `${MYED_DOMAIN}${MyEdBaseURLs.ASPEN}/${path.join("/")}`;

  try {
    const store = await MyEdCookieStore.create();
    const authCookies = getAuthCookies(store);
    // Fetch the content from the original source
    const response = await fetch(url, {
      headers: {
        Cookie: convertObjectToCookieString(authCookies),
      },
    });
    if (!response.ok) {
      return new Response(`Failed to fetch content: ${response.statusText}`, {
        status: response.status,
      });
    }

    // Get the content data
    const contentData = await response.arrayBuffer();

    // Create a new headers object with all relevant headers except cookies
    const headers = new Headers();
    for (const key of [
      "content-type",
      "content-length",
      "content-disposition",
      "cache-control",
    ]) {
      const value = response.headers.get(key);
      if (value) headers.set(key, value);
    }

    // Create a new response with the content data but without cookies
    const newResponse = new Response(contentData, {
      status: response.status,
      headers: headers,
    });

    return newResponse;
  } catch (error) {
    console.error("Error proxying content:", error);
    return new Response("Error fetching content", { status: 500 });
  }
}
