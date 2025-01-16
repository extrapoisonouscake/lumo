import { MYED_ROOT_URL } from "@/constants/myed";

export const getFullMyEdUrl = (pathname: string, isRestAPI = false) =>
  `${MYED_ROOT_URL}/${isRestAPI ? 'rest' : ''}${pathname}`;
