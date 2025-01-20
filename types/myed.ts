import { MyEdEndpoint, MyEdEndpoints } from "@/constants/myed";

export type MyEdEndpointsParams<T extends MyEdEndpoint> = Parameters<
  MyEdEndpoints[T]["call"]
>[1]
export type MyEdEndpointsParamsAsOptional<T extends MyEdEndpoint> =
  MyEdEndpointsParams<T> extends (Record<string, never> | undefined)
  ? []
  : [params: MyEdEndpointsParams<T>];
