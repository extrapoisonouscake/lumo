import { Metadata } from "next";
import { LoginPageContent } from "./content";
export const metadata: Metadata = {
  title: "Sign In",
};
export default function Page() {
  return <LoginPageContent />;
}
