import { MYED_ROOT_URL } from "@/constants/myed";
import { paths } from "@/types/myed-rest";
import createClient from "openapi-fetch";
export const myEdRestAPIClient = createClient<paths>({
  baseUrl: `${MYED_ROOT_URL}/rest`,
  headers: {
    "Content-Type": "application/json",
  },
});
