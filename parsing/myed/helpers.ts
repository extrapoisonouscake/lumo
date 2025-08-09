import { removeLineBreaks } from "@/helpers/removeLineBreaks";
import * as cheerio from "cheerio";
import type { Element } from "domhandler";

export const MYED_TABLE_HEADER_SELECTOR = ".listHeader";

/**
 * Gets the table body element from MyEd content tables
 * @param $ - Cheerio API instance
 * @returns Table body element or error object if table is invalid
 */
export function $getGenericContentTableBody($: cheerio.CheerioAPI) {
  const $tableBody = $(
    ":is(.listGridFixed, .listGrid) tbody:has(> .listHeader:first-of-type)"
  );

  const $lastRow = $tableBody.children("tr:last-of-type");

  // Check for single-column tables (likely error pages)
  if ($tableBody.length === 0 || $lastRow.find("td").length === 1) {
    const errorMessage =
      $('td:has(> img[src="images/exclamation-circle-small.gif"])').text() ||
      $lastRow.prop("innerText");

    if (!errorMessage) {
      return null;
    }

    return { knownError: removeLineBreaks(errorMessage) };
  }

  return $tableBody;
}

/**
 * Extracts table values from a table body element
 * @param $tableBody - Table body element
 * @returns 2D array of table cell values
 */
export function $getTableValues(
  $tableBody: cheerio.Cheerio<Element>
): string[][] {
  const result: string[][] = [];

  // Get all non-header rows
  const $rows = $tableBody.children("tr").not(MYED_TABLE_HEADER_SELECTOR);

  // Process each row
  $rows.each((_, rowElement) => {
    const rowValues: string[] = [];

    // Get all cells in the current row
    const $cells = $tableBody.find(rowElement).children("td");

    // Extract text from each cell
    $cells.each((i, cellElement) => {
      if (i === 0) return; // skip the checkbox column
      const value = $tableBody.find(cellElement).text().trim();
      rowValues.push(value);
    });

    result.push(rowValues);
  });

  return result;
}
