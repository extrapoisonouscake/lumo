import { Subject, SubjectYear } from "@/types/school";
import { prepareStringForURI } from "./prepareStringForURI";

export const getSubjectPageURL =
  (year: SubjectYear) => (props: Pick<Subject, "id" | "name">) => {
    return `/classes/${prepareStringForURI(
      props.name.prettified
    )}/${props.id}?year=${year}`;
  };
