import { MYED_ENDPOINTS } from "@/constants/myed";

export type MyEdFetchEndpoints = Exclude<
  keyof typeof MYED_ENDPOINTS,
  "login" | "logout"
>;
