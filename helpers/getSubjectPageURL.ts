import { Subject, SubjectYear } from "@/types/school";
import { prepareStringForURI } from "./prepareStringForURI";

export const getSubjectPageURL = (
  props: Pick<Subject, "id" | "name"> & { year: SubjectYear }
) => {
  return `/classes/${props.id}/${prepareStringForURI(props.name)}?year=${
    props.year
  }`;
};
