import { removeLineBreaks } from "@/helpers/removeLineBreaks";
import { PersonalDetails } from "@/types/school";

import { getCORSProxyURL } from "@/helpers/getCORSProxyURL";
import { CheerioAPI } from "cheerio";
import { ParserFunctionArguments } from "./types";
type PersonalDetailsParserArguments =
  ParserFunctionArguments<"personalDetails">;
export function parsePersonalDetails({
  responses: [$main, $photoRoot],
}: PersonalDetailsParserArguments): PersonalDetails | undefined {
  const mainDetails = parseMainDetails($main);
  if (!mainDetails) return;
  const photoURL = parsePhotoURL($photoRoot);
  return { ...mainDetails, photoURL };
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
function parseMainDetails($: CheerioAPI) {
  const rawDetailsEntries = $('tr[id^="Property|"]')
    .toArray()
    .map((el) => {
      const $row = $(el);
      const name = $row.find(".detailProperty > span").text();
      const value = $row.find(".detailValue > span").text();
      return [removeLineBreaks(name), removeLineBreaks(value)];
    });
  const result: any = {}; //!
  for (const [key, value] of rawDetailsEntries) {
    const propertyName = detailLabelsMap[key];
    if (!key) continue;
    const valueAsNumber = Number(value);
    result[propertyName] = isNaN(valueAsNumber) ? value : valueAsNumber;
  }
  return result as Omit<PersonalDetails, "photoURL">;
}

function parsePhotoURL($: CheerioAPI) {
  const url = $(
    '[id="propertyValue(relStdPsnOid_psnPhoOIDPrim)-span"] img'
  ).prop("src");
  if (!url) return;
  return getCORSProxyURL(url);
}
