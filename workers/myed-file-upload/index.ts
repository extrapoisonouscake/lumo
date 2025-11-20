/**
 * Cloudflare Worker to handle file uploads to MyEd
 * Bypasses Vercel's 4.5MB limit by uploading directly from client
 */

import * as cheerio from "cheerio";

import CryptoJS from "crypto-js";
import { z } from "zod";
const AUTH_COOKIES_PREFIX = "auth";
const MYED_HTML_TOKEN_INPUT_NAME = "org.apache.struts.taglib.html.TOKEN";
const parseHTMLToken = ($: cheerio.CheerioAPI) =>
  $(`input[name="${MYED_HTML_TOKEN_INPUT_NAME}"]`).first().val() as string;
const requestSchema = z.object({
  file: z.instanceof(File),
  assignmentId: z.string(),
});
const MYED_DOMAIN = "https://myeducation.gov.bc.ca/aspen";
const authCookiesSchema = z.object({
  tokens: z.string(),
  targetId: z.string(),
});
const MYED_SESSION_COOKIE_NAME = "JSESSIONID";
const MYED_AUTHENTICATION_COOKIES_NAMES = [
  MYED_SESSION_COOKIE_NAME,
  "ApplicationGatewayAffinityCORS",
  "ApplicationGatewayAffinity",
] as const;
type AuthCookieName = (typeof MYED_AUTHENTICATION_COOKIES_NAMES)[number];
type AuthCookies = Record<AuthCookieName, string>;
function getAuthCookies(string: string) {
  const tokensObject = string.split(";").map((token) => {
    const [key, value] = token.split("=");
    return [key, decodeURIComponent(value!)];
  });
  return Object.fromEntries(tokensObject) as AuthCookies;
}

const key = CryptoJS.enc.Hex.parse(
  process.env.MYED_CREDENTIALS_ENCRYPTION_KEY!
);

const decrypt = (encryptedString: string) => {
  const encryptedData = CryptoJS.enc.Base64.parse(encryptedString);
  const iv = encryptedData.clone().words.slice(0, 4); // 16 bytes = 4 words
  const ciphertext = encryptedData.clone().words.slice(4);

  const decrypted = CryptoJS.AES.decrypt(
    CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.lib.WordArray.create(ciphertext),
    }),
    key,
    {
      iv: CryptoJS.lib.WordArray.create(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
};
const WEBSITE_ROOT =
  process.env.NODE_ENV === "production"
    ? `https://lumobc.ca`
    : `http://localhost:3000`;
const corsHeaders = {
  "Access-Control-Allow-Origin": WEBSITE_ROOT,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Cookie",
  "Access-Control-Allow-Credentials": "true",
};

export default {
  async fetch(request: Request): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Only allow POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      const formData = Object.fromEntries((await request.formData()).entries());

      const { file, assignmentId } = requestSchema.parse(formData);
      const cookies = request.headers
        .get("Cookie")
        ?.split(";")
        .map((cookie) => cookie.trim())
        .reduce(
          (acc, cookie) => {
            const [key, value] = cookie.split("=");
            if (key.startsWith(AUTH_COOKIES_PREFIX)) {
              acc[key.split(`${AUTH_COOKIES_PREFIX}.`)[1]] = value;
            }
            return acc;
          },
          {} as Record<string, string>
        );

      const encrypted = authCookiesSchema.parse(cookies);

      const { tokens, targetId } = Object.fromEntries(
        Object.entries(encrypted).map(([key, value]) => [
          key,
          decrypt(decodeURIComponent(value)),
        ])
      );

      const tokensObject = getAuthCookies(tokens);

      const cookiesString = MYED_AUTHENTICATION_COOKIES_NAMES.map(
        (name) => `${name}=${tokensObject[name]}`
      ).join("; ");

      const initialResponse = await fetch(`${MYED_DOMAIN}/home.do`, {
        headers: {
          Cookie: cookiesString,
        },
      });

      if (!initialResponse.ok) {
        throw new Error("Failed to upload file");
      }
      const $ = cheerio.load(await initialResponse.text());

      const htmlToken = parseHTMLToken($);

      if (!htmlToken) {
        throw new Error("Failed to upload file");
      }
      const dataToSend = new FormData();
      dataToSend.append("formFile", file);
      dataToSend.append("assignmentOid", assignmentId);
      dataToSend.append("studentOid", targetId);
      dataToSend.append("userEvent", "970");
      dataToSend.append(MYED_HTML_TOKEN_INPUT_NAME, htmlToken);
      const uploadResponse = await fetch(`${MYED_DOMAIN}/assignmentUpload.do`, {
        headers: {
          Cookie: cookiesString,
        },
        method: "POST",
        body: dataToSend,
      });
      return new Response(undefined, {
        status: uploadResponse.ok ? 204 : 500,
        headers: corsHeaders,
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
            ...corsHeaders,
          },
        }
      );
    }
  },
};
