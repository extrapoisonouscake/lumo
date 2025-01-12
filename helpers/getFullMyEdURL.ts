import { MYED_ROOT_URL } from "@/constants/myed";

export const getFullMyEdUrl = (pathname: string) =>
  `${MYED_ROOT_URL}/${pathname}`;
