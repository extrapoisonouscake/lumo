import { Metadata } from "next";
import { SettingsPageContent } from "./content";
export const metadata: Metadata = {
  title: "Register",
};
export default function Page() {
  return <SettingsPageContent />;
}
