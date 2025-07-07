import { Metadata } from "next";
import { SubjectsPageContent } from "./content";
export const metadata: Metadata = {
  title: "Classes",
};
export default function Page() {
  return <SubjectsPageContent />;
}
