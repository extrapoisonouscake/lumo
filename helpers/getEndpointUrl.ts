import { MYED_ENDPOINTS, MYED_ROOT_URL } from "@/constants/myed";

export function getEndpointUrl(
  endpoint: keyof typeof MYED_ENDPOINTS,
  params?: Record<string, string>
) {
  let value: string | ((params: any) => string) = MYED_ENDPOINTS[endpoint];
  if (typeof value === "function") {
    value = value(params);
  }
  return `${MYED_ROOT_URL}/${value}`;
}
