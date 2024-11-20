"use client";

import emojiData from "@/data/apple-emojis.json";
import { ReactNode } from "react";
import { EmojiProvider } from "react-apple-emojis";
import { ThemeProvider } from "./theme-provider";
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      defaultTheme="system"
      enableSystem
    >
      {" "}
      <EmojiProvider data={emojiData}>{children}</EmojiProvider>
    </ThemeProvider>
  );
}
