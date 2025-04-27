import { Metadata } from "next";
import { LoginPageContent } from "./content";
export const metadata: Metadata = {
  title: "Log In",
};
export default function Page() {
  return <LoginPageContent />;
}
