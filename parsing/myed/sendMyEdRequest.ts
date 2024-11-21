import { MYED_AUTHENTICATION_COOKIES_NAMES } from "@/constants/myed";
import { getEndpointUrl } from "@/helpers/getEndpointUrl";
import { MyEdEndpoints, MyEdEndpointsParamsAsOptional } from "@/types/myed";
import { headers } from "next/headers";
import { readPdfText } from 'pdf-text-reader';
import "server-only";

const USER_AGENT_FALLBACK =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

async function main() {
    const pdfText: string = await readPdfText({url: 'https://www.comoxvalleyschools.ca/mark-isfeld-secondary/wp-content/uploads/sites/44/2024/11/DA-Nov-20-2024.pdf'});
    console.info(pdfText);
}

export async function sendMyEdRequest<Endpoint extends MyEdEndpoints>(
  endpoint: Endpoint,
  authCookies: Record<
    (typeof MYED_AUTHENTICATION_COOKIES_NAMES)[number],
    string | undefined
  >,
  ...rest: MyEdEndpointsParamsAsOptional<Endpoint>
) {
main();
  const cookiesString = MYED_AUTHENTICATION_COOKIES_NAMES.map(
    (name) => `${name}=${authCookies[name] || "aspen"}`
  ).join("; ");
  const userAgent = headers().get("User-Agent") || USER_AGENT_FALLBACK;
  const response = await fetch(getEndpointUrl(endpoint, ...rest), {
    headers: {
      Cookie: cookiesString,
      "User-Agent": userAgent,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-CA,en-US;q=0.9,en;q=0.8",
      Connection: "keep-alive",

      Priority: "u=0, i",
      Referer: "https://myeducation.gov.bc.ca/aspen/home.do",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
    },
  });
  return response;
}
