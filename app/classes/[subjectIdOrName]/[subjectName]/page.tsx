import { Metadata } from "next";
import SubjectPage, { SubjectPageProps } from "../page";
export const metadata: Metadata = {
  title: "Loading...",
};
export default function Page(props: SubjectPageProps) {
  return <SubjectPage {...props} />;
}
