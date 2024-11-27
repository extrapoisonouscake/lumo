import { removeLineBreaks } from "@/helpers/removeLineBreaks";
import { PersonalDetails } from "@/types/school";
import { ParserFunctionArguments } from "./types";
import { getFullUrl } from "../../helpers/getEndpointUrl";
export function parsePersonalDetails(
  ...[$main, $photoRoot]: ParserFunctionArguments
): PersonalDetails | undefined {
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
function parseMainDetails($: ParserFunctionArguments[number]) {
  const rawDetailsEntries = $('tr[id^="Property|"]')
    .toArray()
    .map((el) => {
      const $row = $(el);
      const name = $row.find(".detailProperty > span").text();
      const value = $row.find(".detailValue > span").text();
      return [removeLineBreaks(name), removeLineBreaks(value)];
    });

  const result: any = {}; //!
  console.log({ rawDetailsEntries });
  for (const [key, value] of rawDetailsEntries) {
    const propertyName = detailLabelsMap[key];
    if (!key) continue;
    result[propertyName] = value;
  }
  return result as Omit<PersonalDetails, "photoURL">;
}

function parsePhotoURL($: ParserFunctionArguments[number]) {
  const url = $("#propertyValue(relStdPsnOid_psnPhoOIDPrim)-span img").prop(
    "src"
  );
if(!url) return
console.log(url)
  return getFullUrl(url);
}
