import { Subject, SubjectYear } from "@/types/school";
import { prepareStringForURI } from "./prepareStringForURI";

export const getSubjectPageURL =
  (year: SubjectYear) => (props: Pick<Subject, "id" | "name">) => {
    return `/classes/${props.id}/${prepareStringForURI(
      props.name.prettified
    )}?year=${year}`;
  };
