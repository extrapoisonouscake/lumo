"use client";
import dynamic from "next/dynamic";

export const AppleEmoji = dynamic(
  () => import("./component").then((result) => result.AppleEmojiComponent),
  { ssr: false }
);
