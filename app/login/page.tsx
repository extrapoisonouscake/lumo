import { Metadata } from "next";
import { LoginPageContent } from "./content";
export const metadata: Metadata = {
  title: "Login",
};
export default function Page() {
  return <LoginPageContent />;
}
