"use client";
import { WEBSITE_TITLE } from "@/constants/website";
export function TitleManager({ children }: { children: React.ReactNode }) {
  return <title>{`${children} | ${WEBSITE_TITLE}`}</title>;
}
