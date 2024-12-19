import { MyEdFetchEndpoints } from "@/types/myed";
import { CheerioAPI } from "cheerio";

export type ParserFunctionArguments<T extends MyEdFetchEndpoints> = [
  any,
  ...CheerioAPI[]
];
