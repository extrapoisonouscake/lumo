import { PageHeading } from "@/components/layout/page-heading";
import { Outlet } from "react-router";

export default function SubjectsLayout() {
  return (
    <>
      <PageHeading />
      <Outlet />
    </>
  );
}
