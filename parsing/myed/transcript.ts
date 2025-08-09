import { prettifyEducationalName } from "@/helpers/prettifyEducationalName";
import { TranscriptEntry } from "@/types/school";
import { $getGenericContentTableBody, $getTableValues } from "./helpers";
import { ParserFunctionArguments } from "./types";

export function parseTranscriptEntries({
  responses,
}: ParserFunctionArguments<"transcriptEntries">): TranscriptEntry[] {
  const $ = responses.at(-1)!;
  const $tableBody = $getGenericContentTableBody($);
  if (!$tableBody) throw new Error("No table body");
  if ("knownError" in $tableBody) throw new Error($tableBody.knownError);
  const values = $getTableValues($tableBody);
  const transcript = values.map((row) => {
    const [year, grade, subject, finalGrade, credit] = row;
    return {
      year: +year!,
      grade: grade!,
      subjectName: prettifyEducationalName(subject!),
      finalGrade: finalGrade ? +finalGrade : null,
      creditAmount: +credit!,
    };
  });
  return transcript;
}
