import { MyEdEndpoint, MyEdParsingRoute, MyEdParsingRoutes, MyEdRestEndpoint, MyEdRestEndpoints } from "@/constants/myed";

export type MyEdEndpointsParams<T extends MyEdEndpoint> = T extends MyEdParsingRoute ? Parameters<
  MyEdParsingRoutes[T]["call"]
>[0] : T extends MyEdRestEndpoint ? Parameters<
  MyEdRestEndpoints[T]
>[0] : never;
export type MyEdEndpointsParamsAsOptional<T extends MyEdEndpoint> =
  MyEdEndpointsParams<T> extends (Record<string, never> | undefined)
    ? []
    : [params: MyEdEndpointsParams<T>];
