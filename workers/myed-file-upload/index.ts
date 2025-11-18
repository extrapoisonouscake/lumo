/**
 * Cloudflare Worker to handle file uploads to MyEd
 * Bypasses Vercel's 4.5MB limit by uploading directly from client
 */

import { getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { createCookieStore } from "./cookie-store";

import { z } from "zod";
const requestSchema = z.object({
  file: z.instanceof(File),
  assignmentId: z.string(),
});

export default {
  async fetch(
    request: Request,
    env: Record<string, unknown>
  ): Promise<Response> {
    globalThis.process = {
      env,
    } as any;
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Only allow POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    try {
      // Parse the incoming FormData
      const { file, assignmentId } = requestSchema.parse(
        await request.formData()
      );

      // Create Worker-compatible cookie store from request headers
      const workerCookieStore = createCookieStore(request);

      // Wrap in MyEdCookieStore (which expects Next.js cookies interface)
      // Note: MyEdCookieStore.create() will use our workerCookieStore since we pass it
      // but it also tries to call headers() which is Next.js-specific, so we need
      // to handle that. We'll bypass the create() method and use the constructor directly
      // by casting - the constructor is private but we can work around it with type casting
      const store = new MyEdCookieStore(workerCookieStore);

      const getMyEdWithParameters = getMyEd({
        authCookies: getAuthCookies(store),
        myedUser: store.get("user")?.value
          ? JSON.parse(store.get("user")?.value!)
          : undefined,
        targetId: store.get("targetId")?.value,
      });

      // Upload file to MyEd
      const myedResponse = await getMyEdWithParameters("uploadAssignmentFile", {
        file,
        assignmentId,
      });

      // Return the response from MyEd
      return new Response(undefined, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Error processing file upload:", error);
      return new Response(
        JSON.stringify({
          error:
            error instanceof Error ? error.message : "Internal server error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
