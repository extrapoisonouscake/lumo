"use client";
import { SubjectSummary } from "@/types/school";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function SubjectNameReplacer({ id }: { id: SubjectSummary["id"] }) {
  const pathname = usePathname();
  useEffect(() => {
    const segments = pathname.split("/");
    if (segments[2].startsWith("n_")) {
      segments[2] = id;
      window.history.replaceState({}, "", segments.join("/"));
    }
  }, []);
  return null;
}
