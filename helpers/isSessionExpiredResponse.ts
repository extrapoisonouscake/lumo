import { sessionExpiredIndicator } from "@/parsing/myed/fetchMyEd";

export function isSessionExpiredResponse(
  response: any
): response is typeof sessionExpiredIndicator {
  return response === sessionExpiredIndicator;
}
