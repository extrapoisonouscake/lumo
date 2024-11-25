import {
  AllowedEndpointValues,
  EndpointResolvedValue,
  MYED_ENDPOINTS,
  MYED_ROOT_URL,
} from "@/constants/myed";
import { MyEdEndpoints, MyEdEndpointsParamsAsOptional } from "@/types/myed";
export const getFullUrl = (pathname: string) => `${MYED_ROOT_URL}/${pathname}`;
export function getEndpointUrl<Endpoint extends MyEdEndpoints>(
  endpoint: Endpoint,
  ...params: MyEdEndpointsParamsAsOptional<Endpoint>
) {
  let value: AllowedEndpointValues = MYED_ENDPOINTS[endpoint];
  if (typeof value === "function") {
    value = value(params[0] as NonNullable<(typeof params)[0]>);
  }
  let result;
  if (Array.isArray(value)) {
    result = value.map((stringOrFunc) =>
      typeof stringOrFunc === "string" ? getFullUrl(stringOrFunc) : stringOrFunc
    );
  } else {
    result = getFullUrl(value);
  }
  return result as EndpointResolvedValue<Endpoint>;
}
