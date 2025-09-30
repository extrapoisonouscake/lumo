"use client";
import { WEBSITE_TITLE } from "@/constants/website";
export function TitleManager({
  children,
}: {
  children?: React.ReactNode | React.ReactNode[];
}) {
  return (
    <title>{`${children ? `${Array.isArray(children) ? children.join("") : children.toString()} | ` : ""}${WEBSITE_TITLE}`}</title>
  );
}
