import { Report } from "@/types/school";
import { OpenAPI200JSONResponse, ParserFunctionArguments } from "./types";

export function parseReports({
  responses: [data],
}: ParserFunctionArguments<
  "reports",
  [OpenAPI200JSONResponse<"/app/rest/files/currentUser">]
>): Report[] {
  return data.map((report) => ({
    id: report.fileOid,
    name: report.name,
    description: report.description,
    createdAt: new Date(report.created),
    isOpened: report.opened,
    viewId: report.reportDeliveryRecipientOid,
  }));
}
