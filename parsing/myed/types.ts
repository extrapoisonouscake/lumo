import { MyEdEndpoint, MyEdRestEndpoint } from "@/constants/myed";
import { MyEdEndpointsParams } from "@/types/myed";

import { CheerioAPI } from "cheerio";

export type ParserFunctionArguments<T extends MyEdEndpoint> = [
  MyEdEndpointsParams<T>,
  ...(T extends MyEdRestEndpoint ? Record<string, any> : CheerioAPI)[]
];