"use client";
import { prepareStringForURI } from "@/helpers/prepareStringForURI";
import { SubjectSummary } from "@/types/school";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function SubjectNameReplacer({
  id,
  newName,
}: {
  id: SubjectSummary["id"];
  newName: SubjectSummary["name"];
}) {
  const pathname = usePathname();
  useEffect(() => {
    const segments = pathname.split("/");
    if (segments[2].startsWith("n_")) {
      segments[2] = id;
      segments.push(prepareStringForURI(newName));
      window.history.replaceState({}, "", segments.join("/"));
    }
  }, []);
  return null;
}
