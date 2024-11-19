import { MYED_ENDPOINTS, MYED_ROOT_URL } from "@/constants/myed";
import { MyEdEndpoints, MyEdEndpointsParamsAsOptional } from "@/types/myed";

export function getEndpointUrl<Endpoint extends MyEdEndpoints>(
  endpoint: Endpoint,
  ...params: MyEdEndpointsParamsAsOptional<Endpoint>
) {
  let value: string | ((params: any) => string) = MYED_ENDPOINTS[endpoint];
  if (typeof value === "function") {
    value = value(params[0]);
  }
  return `${MYED_ROOT_URL}/${value}`;
}
