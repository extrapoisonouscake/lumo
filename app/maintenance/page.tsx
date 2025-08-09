import { WEBSITE_TITLE } from "@/constants/website";
import { Metadata } from "next";
import { MaintenancePageContent } from "./content";

export const metadata: Metadata = {
  title: `Maintenance in Progress | ${WEBSITE_TITLE}`,
};

export default function MaintenancePage() {
  return <MaintenancePageContent />;
}
