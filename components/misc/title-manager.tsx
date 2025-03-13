"use client";
import { WEBSITE_TITLE } from "@/constants/website";
import { useEffect } from "react";

export function TitleManager({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} | ${WEBSITE_TITLE}`;
  }, [title]);
  return null;
}
