import { MYED_ROOT_URL } from "@/constants/myed";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params: { path } }: { params: { path: string[] } }
) {
  const url = `${MYED_ROOT_URL}${path.join("/")}`;

  try {
    // Fetch the content from the original source
    const response = await fetch(url);
    console.log({ response });
    if (!response.ok) {
      return new Response(`Failed to fetch content: ${response.statusText}`, {
        status: response.status,
      });
    }

    // Get the content data
    const contentData = await response.arrayBuffer();

    // Get headers from original response
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");
    const contentDisposition = response.headers.get("content-disposition");
    const cacheControl = response.headers.get("cache-control");

    // Create a new headers object with all relevant headers except cookies
    const headers = new Headers();
    if (contentType) headers.set("Content-Type", contentType);
    if (contentLength) headers.set("Content-Length", contentLength);
    if (contentDisposition)
      headers.set("Content-Disposition", contentDisposition);
    if (cacheControl) {
      headers.set("Cache-Control", cacheControl);
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
