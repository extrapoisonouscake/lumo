import { JSDOM } from "jsdom";
import { removeLineBreaks } from "../helpers/removeLineBreaks";
export function parseSchedule(dom: JSDOM) {
  const rootContainer = dom.window.document.querySelector(".contentContainer");
  if (!rootContainer) return null;
  const tableSecondLevelContainer =
    rootContainer.lastChild?.firstChild?.lastChild?.firstChild;
  //":scope > table:last-of-type > tbody > tr:last-of-type > td"

  if (!tableSecondLevelContainer) return null;
  const tableContainer =
    tableSecondLevelContainer.querySelector(".listGridFixed");
  if (!tableContainer) {
    const errorMessage = tableSecondLevelContainer.textContent;
    return { knownError: errorMessage ? removeLineBreaks(errorMessage) : null }; //! ?needed?
  }
  const tableBody = tableContainer.firstChild.querySelector("table > tbody");
  //":scope > table table > tbody"
  if (!tableBody) return null;
  const weekdayName =
    tableBody.querySelector(".listHeader th:last-of-type")?.textContent ?? null;
  if (!!tableContainer.querySelector("listNoRecordsText")) return [];
  console.log([...tableBody.querySelectorAll("tr:not(.listHeader)")].length);
  const data = [...tableBody.querySelectorAll("tr:not(.listHeader)")].map(
    (row) => {
      console.log(row);
      const [timeTd, contentTd] = [...row.getElementsByTagName("td")];
      return {
        time: timeTd.textContent,
        content: contentTd.textContent,
      };
    }
  );
  //!    satisfies Subject[];
  return { weekdayName, data };
}
