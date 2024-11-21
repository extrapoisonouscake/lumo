import dynamic from "next/dynamic";

export const ThemeToggle = dynamic(
  () => import("./component").then((result) => result.ThemeToggleComponent),
  { ssr: false }
);
