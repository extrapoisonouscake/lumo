import {
  PageDataProvider,
  PageHeading,
} from "@/components/layout/page-heading";
import { WEBSITE_TITLE } from "@/constants/website";
import { Metadata } from "next";
import { ReactNode } from "react";
export const metadata: Metadata = {
  title: {
    default: "Classes",
    template: `%s - Classes | ${WEBSITE_TITLE}`,
  },
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <PageDataProvider>
      <PageHeading />
      {children}
    </PageDataProvider>
  );
}
