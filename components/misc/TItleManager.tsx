"use client";
import { useEffect } from "react";

export function TitleManager({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}
