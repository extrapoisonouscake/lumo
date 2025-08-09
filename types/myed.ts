import { MyEdEndpoint, MyEdEndpoints } from "@/parsing/myed/routes";

export type MyEdEndpointsParams<T extends MyEdEndpoint> = Parameters<
  MyEdEndpoints[T]["call"]
>[1];
export type MyEdEndpointsParamsAsOptional<T extends MyEdEndpoint> =
  MyEdEndpointsParams<T> extends Record<string, never> | undefined
    ? []
    : [params: MyEdEndpointsParams<T>];
