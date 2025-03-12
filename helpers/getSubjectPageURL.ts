import { Subject } from "@/types/school";

export const getSubjectPageURL = ({
  id,
  actualName,
}: Pick<Subject, "actualName"> & { id?: string }) => {
  let path = `/classes/`;
  if (id) {
    path += id;
  } else {
    path += `n_${encodeURIComponent(actualName)}`;
  }
  return path;
};
