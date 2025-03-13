import { prettifyEducationalName } from "@/helpers/prettifyEducationalName";

export const convertPathParameterToSubjectName = (rawName: string) =>
  prettifyEducationalName(rawName.replaceAll("_", " "));
