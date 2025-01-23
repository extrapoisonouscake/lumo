import { Subject } from "@/types/school";

export const getSubjectPageURL = (subject: Pick<Subject, "actualName"> & { id?: string }) => {
  return `/classes/${subject.actualName.replaceAll(" ", "_")}${subject.id ? `/${subject.id}` : ""}`;
};
