import { getCORSProxyURL } from "@/helpers/getCORSProxyURL";
import { removeLineBreaks } from "@/helpers/removeLineBreaks";
import { PersonalDetails } from "@/types/school";
import { CheerioAPI } from "cheerio";
import { ParserFunctionArguments } from "./types";

// Utility: Clean and trim text
function cleanText(text: string): string {
  return removeLineBreaks(text).trim();
}

type PersonalDetailsParserArguments =
  ParserFunctionArguments<"personalDetails">;

export function parsePersonalDetails({
  responses: [$main, $addressesRoot, $photoRoot],
}: PersonalDetailsParserArguments): PersonalDetails {
  const mainDetails = parseMainDetails($main!);
  const addresses = parseAddresses($addressesRoot!);
  const photoURL = parsePhotoURL($photoRoot!);
  return { ...mainDetails, addresses, photoURL };
}

type FirstPageDetails = Omit<PersonalDetails, "photoURL" | "addresses">;
const detailLabelsMap: Record<string, keyof FirstPageDetails> = {
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

function parseMainDetails($: CheerioAPI): FirstPageDetails {
  const rawDetails = Object.fromEntries(
    $('tr[id^="Property|"]')
      .toArray()
      .map((el) => {
        const $row = $(el);
        const name = cleanText($row.find(".detailProperty > span").text());
        const value = cleanText($row.find(".detailValue > span").text());
        return [name, value];
      })
  );
  const { known } = parseDetails<FirstPageDetails>(detailLabelsMap, rawDetails);
  // Ensure taRoom is a string if present
  if (typeof known.taRoom === "string") {
    known.taRoom = known.taRoom.replace(/^TA\s*/, "");
  }
  return { ...known, grade: +known.grade };
}

const addressLabelsMap: Record<string, keyof PersonalDetails["addresses"]> = {
  "Physical Address": "physical",
  "Mailing Address": "mailing",
  "Secondary Physical Address": "secondaryPhysical",
  "Other Address": "other",
};

function parseAddresses($: CheerioAPI): PersonalDetails["addresses"] {
  const result = $("#mainTable table")
    .toArray()
    .map((table) => {
      const addressComponents = $(table)
        .find('input[name^="propertyValue"]')
        .toArray()
        .map((el) => {
          const value = $(el).val();
          return value ? value.toString() : "";
        });
      // Only join non-empty components
      const address =
        [addressComponents[0], addressComponents[1]].filter(Boolean).join(" ") +
        (addressComponents[2] ? `, ${addressComponents[2]}` : "");
      const label = cleanText(
        $(table).find('tr[id^="Group|"] > td:nth-of-type(1)').text()
      );
      return [label, address];
    });
  const parsed = parseDetails(addressLabelsMap, Object.fromEntries(result));
  return {
    ...parsed.known,
    custom: parsed.unknown,
  };
}

function parseDetails<Known extends Record<string, string | number>>(
  map: Record<string, keyof Known>,
  rawDetails: Record<string, string>
): { known: Known; unknown: Record<string, string> } {
  const known: Partial<Known> = {};
  const unknown: Record<string, string> = {};
  for (const [label, value] of Object.entries(rawDetails)) {
    if (!value) continue;
    const key = map[label];
    if (key) {
      known[key] = value as Known[keyof Known];
    } else {
      unknown[label] = value;
    }
  }
  return { known: known as Known, unknown };
}

function parsePhotoURL($: CheerioAPI): string | undefined {
  const url = $(
    '[id="propertyValue(relStdPsnOid_psnPhoOIDPrim)-span"] img'
  ).prop("src");
  return url ? getCORSProxyURL(url) : undefined;
}
