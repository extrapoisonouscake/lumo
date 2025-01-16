import { MYED_ROOT_URL } from "@/constants/myed";
import { NextRequest, NextResponse } from "next/server";
const getTargetUrl = (path: string) => `${MYED_ROOT_URL}/rest${path}`;
const filterResponseHeaders = (headers: Headers) =>
  new Headers(
    [...headers.entries()].filter(
      ([key]) =>
        !["content-encoding", "content-length"].includes(key.toLowerCase())
    )
  );

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const targetPath = url.pathname.replace("/swagger/proxy", "") + url.search;
  const targetUrl = getTargetUrl(targetPath);

  try {
    console.log({ targetUrl })
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers),
        cookie: request.headers.get("Custom-Cookie") || "",
        host: new URL(MYED_ROOT_URL).host,
      },
      credentials: "include",
    });

    const body = await response.text();
    const headers = new Headers(response.headers);

    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: filterResponseHeaders(headers),
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Proxy error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const targetPath = url.pathname.replace("/swagger/proxy", "");
  const targetUrl = getTargetUrl(targetPath);

  try {
    const body = await request.json();
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        ...request.headers,
        cookie: request.headers.get("custom-cookie") || "",
        host: new URL(MYED_ROOT_URL).host,
      },
      body,
      credentials: "include",
    });

    const responseBody = await response.text();
    const headers = new Headers(response.headers);

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: filterResponseHeaders(headers),
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Proxy error", { status: 500 });
  }
}
