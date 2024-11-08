import { MYED_AUTHENTICATION_COOKIES_NAMES } from "@/constants/myed";
import { getEndpointUrl } from "@/helpers/getEndpointUrl";
import * as cookie from "cookie";
import { JSDOM } from "jsdom";
import "server-only";
const HTML_TOKEN_INTERNAL_NAME = "org.apache.struts.taglib.html.TOKEN";
export async function authenticateUser(username: string, password: string) {
  const loginTokenResponse = await fetch(getEndpointUrl("login"), {
    credentials: "include",
  });
  if (!loginTokenResponse.ok) {
    throw new Error("Failed"); //!
  }

  const cookiesString = loginTokenResponse.headers.getSetCookie();
  if (!cookiesString) throw new Error("Failed"); //!
  let cookiesToAdd = Object.entries(cookie.parse(cookiesString.join("; ")));
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
    userEvent: "930",
    deploymentId: "aspen",
    scrollX: "0",
    scrollY: "0",
    mobile: "false",
    formFocusField: "username",
    username: username,
    password: password,
    districtId: "Ent",
    idpName: "BCSC Production SSO",
  };
  for (const [key, value] of Object.entries(loginParams)) {
    loginFormData.append(key, value);
  }
  const loginResponse = await fetch(getEndpointUrl("login"), {
    method: "POST",
    body: loginFormData,
    headers: {
      Cookie: cookiesToAdd
        .map((c) => cookie.serialize(c[0], c[1] || ""))
        .join("; "),
    },
  });

  const loginHtml = await loginResponse.text();
  if (`${loginResponse.status}`[0] !== "3") {
    if (!loginResponse.ok) {
      throw new Error("Failed"); //!
    }
    const loginDom = new JSDOM(loginHtml);
    if (!loginDom.window.document.getElementById("pageMenuContainer")) {
      const errorMessageScriptContent = [
        ...loginDom.window.document.querySelectorAll(
          'script[language="JavaScript"]'
        ),
      ]
        .filter((elem) => !elem.getAttribute("type"))
        .map((e) => e.textContent)
        .filter(Boolean);
      if (errorMessageScriptContent) {
        const errorMessage = errorMessageScriptContent
          .map(
            (c) =>
              (c as NonNullable<typeof c>).match(
                /var\s+(\w+)\s*=\s*(['"`])(.*?)\2\s*;/
              )?.[3]
          )
          .filter(Boolean)[0];
        if (errorMessage) throw new Error(errorMessage);
      }
    }
  }
  return cookiesToAdd.filter(([name]) =>
    MYED_AUTHENTICATION_COOKIES_NAMES.includes(name)
  );
}
