import { PageHeading } from "@/components/layout/page-heading";
import { ReactNode } from "react";
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageHeading />
      {children}
    </>
  );
}
