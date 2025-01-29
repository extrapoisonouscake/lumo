import { MYED_ROOT_URL } from "@/constants/myed";
import { fetchMyEd } from "@/instances/fetchMyEd";

import { NextRequest, NextResponse } from "next/server";

const ALLOWED_PATHS = ["photos/aspen"];

function isAllowedPath(pathname: string): boolean {
  return ALLOWED_PATHS.some((allowedPath) => pathname.startsWith(allowedPath));
}

const filterResponseHeaders = (headers: Headers) =>
  new Headers(
    [...headers.entries()].filter(
      ([key]) =>
        !["content-encoding", "content-length"].includes(key.toLowerCase())
    )
  );

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const targetPath = url.pathname.replace("/api/aspen/", "");

  if (!isAllowedPath(targetPath)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const targetUrl = `${targetPath}${url.search}`;
  console.log(targetUrl);
  try {
    const response = await fetchMyEd(targetUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers),
        host: new URL(MYED_ROOT_URL).host,
      },
      credentials: "include",
    });

    const headers = new Headers(response.headers);

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: filterResponseHeaders(headers),
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Proxy error", { status: 500 });
  }
}
