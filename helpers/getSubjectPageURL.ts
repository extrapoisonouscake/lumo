import { Subject } from "@/types/school";

export const getSubjectPageURL = (subject: Pick<Subject, "actualName">) => {
  return `/classes/${subject.actualName.replaceAll(" ", "_")}`;
};
