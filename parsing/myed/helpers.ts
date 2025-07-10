import { removeLineBreaks } from "@/helpers/removeLineBreaks";
import * as cheerio from "cheerio";

export function $getTableBody($: cheerio.CheerioAPI) {
  const $tableBody = $(
    ":is(.listGridFixed, .listGrid) tbody:has(> .listHeader:first-of-type)"
  );
  const lastRow = $tableBody.children("tr:last-of-type");
  //there is probably no tables with only one column, so we can check for known errors like this
  if ($tableBody.length === 0 || lastRow.find("td").length === 1) {
    const errorMessage =
      $('td:has(> img[src="images/exclamation-circle-small.gif"])').text() ||
      lastRow.prop("innerText");
    if (!errorMessage) return null;
    return { knownError: removeLineBreaks(errorMessage) }; //! ?needed?
  }

  return $tableBody;
}
export const MYED_TABLE_HEADER_SELECTOR = ".listHeader";
