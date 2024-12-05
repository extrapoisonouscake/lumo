import { MYED_ENDPOINTS } from "@/constants/myed";

export type MyEdFetchEndpoints = Exclude<
  keyof typeof MYED_ENDPOINTS,
  "login" | "logout"
>;
type Endpoints = typeof MYED_ENDPOINTS;
export type MyEdEndpoints = keyof Endpoints;
export type MyEdEndpointsParams<T extends MyEdEndpoints> =
  Endpoints[T] extends (args: infer P) => any ? P : never;
export type MyEdEndpointsParamsAsOptional<T extends MyEdEndpoints> =
  MyEdEndpointsParams<T> extends never ? [] : [params: MyEdEndpointsParams<T>];
export type MyEdEndpointsParamsAsOptionalObject<T extends MyEdEndpoints> =
  MyEdEndpointsParams<T> extends never ? {} : MyEdEndpointsParams<T>;
export type MyEdEndpointsParamsWithUserID<T extends MyEdEndpoints> =
  T extends MyEdFetchEndpoints
    ? [
        params: {
          userID: string;
        } & MyEdEndpointsParamsAsOptionalObject<T>
      ]
    : [];
