import { removeLineBreaks } from "@/helpers/removeLineBreaks";
import * as cheerio from "cheerio";
export function $getTableBody($: cheerio.CheerioAPI) {
  const $tableBody = $(".listGridFixed, .listGrid")
    .find("tbody:has(> .listHeader)")
    .first();
  //there is probably no tables with only one column, so we can check for known errors like this
  const lastRow = $tableBody.children("tr:last-of-type");
  if ($tableBody.length === 0 || lastRow.find("td").length === 1) {
    const errorMessage =
      $('td:has(> img[src="images/exclamation-circle-small.gif"])').text() ??
      lastRow.text();
    if (!errorMessage) return null;
    return { knownError: removeLineBreaks(errorMessage) }; //! ?needed?
  }

  return $tableBody;
}
export const MYED_TABLE_HEADER_SELECTOR = ".listHeader";
