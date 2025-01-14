import { MyEdParsingRoute, MyEdRoute, MyEdRoutes } from "@/constants/myed";

export type MyEdEndpointsParams<T extends MyEdRoute> = MyEdRoutes[T] extends (
  args: infer P
) => any
  ? P
  : never;
export type MyEdEndpointsParamsAsOptional<T extends MyEdRoute> =
  MyEdEndpointsParams<T> extends never ? [] : [params: MyEdEndpointsParams<T>];
type MyEdEndpointsParamsAsOptionalObject<T extends MyEdRoute> =
  MyEdEndpointsParams<T> extends never ? {} : MyEdEndpointsParams<T>;
export type MyEdEndpointsParamsWithUserID<T extends MyEdRoute> =
  T extends MyEdParsingRoute
    ? [
        params: {
          userID: string;
        } & MyEdEndpointsParamsAsOptionalObject<T>
      ]
    : [];
