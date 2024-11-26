import { PersonalDetails } from "@/types/school";
import { ParserFunctionArguments } from "./types";
export function parsePersonalDetails(
  ...[$main, $photoRoot]: ParserFunctionArguments
): PersonalDetails {
  const mainDetails = parseMainDetails($main);
  return { ...mainDetails };
}
const detailLabelsMap: Record<string, keyof PersonalDetails> = {
  "Usual first name": "firstName",
  "Usual middle name": "middleName",
  "Usual last name": "lastName",
  "Pupil #": "studentNumber",
  "Personal Education Number": "personalEducationNumber",
  Homeroom: "taRoom",
  Locker: "locker",
  "School > Name": "schoolName",
  "Next School > Name": "nextSchoolName",
  "Year of graduation": "graduationYear",
  "Grade level": "grade",
  "Parking Space": "parkingSpaceNumber",
  "License Plate #": "licensePlateNumber",
};
function parseMainDetails($: ParserFunctionArguments[number]) {
  const $mainTable = $("#mainTable");
  if ($mainTable.length === 0) return;
  const $columns = $mainTable.find("table[id^=Column]");
  for (const $column in $columns.toArray()) {
    $($column);
  }
  const { info: rawDetailsEntries } = $.extract({
    info: [
      {
        selector: 'tr[id^="Property|"]',
        value: (el, key) => {
          const $row = $(el);
          const name = $row.find(".detailProperty > span").text();
          const value = $row.find(".detailValue > span").text();
          return [name, value];
        },
      },
    ],
  });
  const result: any = {}; //!
  for (const [key, value] of rawDetailsEntries) {
    const propertyName = detailLabelsMap[key];
    if (!key) continue;
    result[propertyName] = value;
  }
  return result as Omit<PersonalDetails, "photoURL">;
}
