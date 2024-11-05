import { MYED_ENDPOINTS, MYED_ROOT_URL } from "@/constants/myed";

export function getEndpointUrl(endpoint: keyof typeof MYED_ENDPOINTS) {
  return `${MYED_ROOT_URL}/${MYED_ENDPOINTS[endpoint]}?navkey=a`;
}
