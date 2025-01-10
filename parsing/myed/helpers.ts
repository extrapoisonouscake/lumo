import { CheerioAPI } from "cheerio";
import { Element } from "domhandler";
export const getDataTableHeaderAndRows$ = ($: CheerioAPI) => {
  const $tableContainer = $("#dataGrid");
  if ($tableContainer.length === 0) return null;

  const header = $tableContainer.find(".listHeader");
  let rows: Element[] = [];
  if ($tableContainer.find(".listNoRecordsText").length === 0) {
    rows = $tableContainer.find(".listCell").toArray();
  }
  return { header, rows };
};
