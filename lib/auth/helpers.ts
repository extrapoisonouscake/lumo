import { MYED_AUTHENTICATION_COOKIES_NAMES } from "@/constants/myed";
import { getEndpointUrl } from "@/helpers/getEndpointUrl";
import * as cookie from "cookie";
import { JSDOM } from "jsdom";
import "server-only";
const HTML_TOKEN_INTERNAL_NAME = "org.apache.struts.taglib.html.TOKEN";
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
  const loginTokenDom = new JSDOM(loginTokenHTML);
  const loginToken = (
    loginTokenDom.window.document.getElementsByName(
      HTML_TOKEN_INTERNAL_NAME
    )[0] as HTMLInputElement
  ).value;
  const loginFormData = new FormData();
  const loginParams = {
    [HTML_TOKEN_INTERNAL_NAME]: loginToken,
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
  const dom = new JSDOM(html);
  if (dom.window.document.getElementById("pageMenuContainer")) return null;
  const errorMessageScriptContent = [
    ...dom.window.document.querySelectorAll('script[language="JavaScript"]'),
  ]
    .filter((elem) => !elem.getAttribute("type"))
    .map((e) => e.textContent)
    .filter(Boolean);
  if (!errorMessageScriptContent) return null;
  const errorMessage = errorMessageScriptContent
    .map(
      (c) =>
        (c as NonNullable<typeof c>).match(
          /var\s+(\w+)\s*=\s*(['"`])(.*?)\2\s*;/
        )?.[3]
    )
    .filter(Boolean)[0];
  return errorMessage || null;
}
