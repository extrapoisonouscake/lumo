import { fetchMyEd } from "@/parsing/myed/fetchMyEd";

export async function UserHeader() {
  const data = await fetchMyEd("personalDetails");
  return null;
}
