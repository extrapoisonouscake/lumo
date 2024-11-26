import {
  MYED_AUTHENTICATION_COOKIES_NAMES,
  MYED_HTML_TOKEN_INPUT_NAME,
} from "@/constants/myed";
import { getEndpointUrl } from "@/helpers/getEndpointUrl";
import * as cookie from "cookie";

import * as cheerio from "cheerio";
import "server-only";
const loginDefaultParams = {
  userEvent: "930",
  deploymentId: "aspen",
  scrollX: "0",
  scrollY: "0",
  mobile: "false",
  formFocusField: "username",
  districtId: "Ent",
  idpName: "BCSC Production SSO",
};
export async function authenticateUser(username: string, password: string) {
  const loginTokenResponse = await fetch(getEndpointUrl("login"), {
    credentials: "include",
  });
  if (!loginTokenResponse.ok) {
    throw new Error("Failed"); //!
  }

  const loginTokenHTML = await loginTokenResponse.text();
  const $loginTokenDOM = cheerio.load(loginTokenHTML);
  const loginToken = $loginTokenDOM(`[name="${MYED_HTML_TOKEN_INPUT_NAME}"]`)
    .first()
    .val();
  if (!loginToken) throw new Error("Failed"); //!
  const loginFormData = new FormData();
  const loginParams = {
    [MYED_HTML_TOKEN_INPUT_NAME]: Array.isArray(loginToken)
      ? loginToken[0]
      : loginToken,
    username,
    password,
    ...loginDefaultParams,
  };
  for (const [key, value] of Object.entries(loginParams)) {
    loginFormData.append(key, value);
  }
  const cookiesString = loginTokenResponse.headers.getSetCookie();
  if (!cookiesString) throw new Error("Failed"); //!
  const cookiesToAdd = Object.entries(cookie.parse(cookiesString.join("; ")));
  const loginResponse = await fetch(getEndpointUrl("login"), {
    method: "POST",
    body: loginFormData,
    headers: {
      Cookie: cookiesToAdd
        .map((c) => cookie.serialize(c[0], c[1] || ""))
        .join("; "),
    },
  });

  if (!loginResponse.ok) {
    throw new Error("Failed"); //!
  }
  const loginHtml = await loginResponse.text();
  const errorMessage = parseLoginErrorMessage(loginHtml);
  if (errorMessage) throw new Error(errorMessage);
  return cookiesToAdd.filter(([name]) =>
    MYED_AUTHENTICATION_COOKIES_NAMES.includes(name)
  );
}
function parseLoginErrorMessage(html: string) {
  const $ = cheerio.load(html);
  if ($("#pageMenuContainer").length > 0) return null;
  const errorMessageScriptContent = $(
    'script[language="JavaScript"]:not([type])'
  )
    .toArray()
    .map((e) => $(e).text())
    .filter(Boolean);
  if (errorMessageScriptContent.length === 0) return null;
  const errorMessage = errorMessageScriptContent
    .map(
      (c) =>
        (c as NonNullable<typeof c>).match(
          /var\s+(\w+)\s*=\s*(['"`])(.*?)\2\s*;/
        )?.[3]
    )
    .filter(Boolean)[0];
  return errorMessage ?? null;
}
