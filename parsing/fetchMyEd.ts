import { MyEdFetchEndpoints } from "@/types/myed";
import "server-only";
import { fetchMyEdPageHTML } from "./fetchMyEdPageHTML";
import { parseSubjects } from "./subjects";
const endpointToFunction = {
  subjects: parseSubjects,
} as const satisfies Record<MyEdFetchEndpoints, (html: string) => any>;
export async function fetchMyEd(endpoint: MyEdFetchEndpoints) {
  const html = await fetchMyEdPageHTML(endpoint);
  return endpointToFunction[endpoint](html);
}
