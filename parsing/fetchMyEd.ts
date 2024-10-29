import { MyEdFetchEndpoints } from "@/types/myed";
import { fetchMyEdPageHTML } from "./fetchMyEdPageHTML";
import { parseSubjects } from "./parseSubjects";
const endpointToFunction = {
  subjects: parseSubjects,
} as const satisfies Record<MyEdFetchEndpoints, (html: string) => any>;
export async function fetchMyEd(endpoint: MyEdFetchEndpoints) {
  const html = await fetchMyEdPageHTML(endpoint);
  return endpointToFunction[endpoint](html);
}
