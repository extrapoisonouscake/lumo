import { MyEdParsingRoute, MyEdParsingRoutes } from "@/constants/myed";

export type MyEdEndpointsParams<T extends MyEdParsingRoute> = Parameters<
  MyEdParsingRoutes[T]["call"]
>[0];

export type MyEdEndpointsParamsAsOptional<T extends MyEdParsingRoute> =
  MyEdEndpointsParams<T> extends Record<string, never>
    ? []
    : [params: MyEdEndpointsParams<T>];
