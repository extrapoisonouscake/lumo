import { Subject } from "@/types/school";
import { prepareStringForURI } from "./prepareStringForURI";

export const getSubjectPageURL = (
  props: Pick<Subject, "actualName"> &
    (
      | { id: Subject["id"]; name: Subject["name"] }
      | { id?: never; name?: never }
    )
) => {
  let path = `/classes/`;
  if (props.id) {
    path += `${props.id}/${prepareStringForURI(props.name)}`;
  } else {
    path += `n_${encodeURIComponent(props.actualName)}`;
  }
  return path;
};
