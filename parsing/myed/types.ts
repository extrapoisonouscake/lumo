import { MyEdEndpoint,MyEdRestEndpoint, MyEdRestEndpointURL,ResolvedMyEdRestEndpoint } from "@/constants/myed";
import { MyEdEndpointsParams } from "@/types/myed";
import { paths } from "@/types/myed-rest";

import { CheerioAPI } from "cheerio";

export type ParserFunctionArguments<T extends MyEdEndpoint,KnownRestResponse =any> = {
  params:MyEdEndpointsParams<T>,
  responses:(T extends MyEdRestEndpoint ? KnownRestResponse : CheerioAPI[]),
  metadata:Record<string,any>
}


export type OpenAPI200ResponseContent<T extends MyEdRestEndpointURL> = paths[T]['get']['responses'][200]['content']
export type OpenAPI200JSONResponse<T extends MyEdRestEndpointURL> = 'application/json' extends keyof OpenAPI200ResponseContent<T> ? OpenAPI200ResponseContent<T>['application/json']: never