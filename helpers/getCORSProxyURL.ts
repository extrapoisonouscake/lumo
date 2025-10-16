import { WEBSITE_ROOT } from "@/constants/website";

export function getCORSProxyURL(url: string) {
  return `${WEBSITE_ROOT}/api/aspen/${url}`;
}
