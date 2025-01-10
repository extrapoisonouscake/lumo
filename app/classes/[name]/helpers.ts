import { prettifySubjectName } from "@/helpers/prettifySubjectName";

export const convertPathParameterToSubjectName = (rawName: string) =>
  prettifySubjectName(rawName.replaceAll("_", " "));
