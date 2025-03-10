"use client";

import { usePageData } from "@/components/layout/page-heading";
import { Assignment } from "@/types/school";
import { useEffect } from "react";

export function SubjectAssignmentBreadcrumbHelper({
  assignmentName,
}: {
  assignmentName: Assignment["name"];
}) {
  const { pageData, setBreadcrumbItem } = usePageData();
  useEffect(() => {
    if (!pageData || pageData.breadcrumb[2]?.name === assignmentName) return;

    setBreadcrumbItem(2, { name: assignmentName });
  }, [pageData]);
  return null;
}
