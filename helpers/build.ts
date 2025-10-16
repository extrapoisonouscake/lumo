import { isMobileApp } from "@/constants/ui";

export const excludePageGenerateStaticParams = () => {
  const array = [];
  if (isMobileApp) array.push({ notFound: true });
  return array;
};
