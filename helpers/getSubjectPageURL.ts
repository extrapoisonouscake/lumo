import { Subject } from "@/types/school";
import { prepareStringForURI } from "./prepareStringForURI";

export const getSubjectPageURL = (props: Pick<Subject, "id" | "name">) => {
  return `/classes/${props.id}/${prepareStringForURI(props.name)}`;
};
