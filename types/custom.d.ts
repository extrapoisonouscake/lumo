import "tailwindcss/tailwind-config";

declare module "tailwindcss/tailwind-config" {
  interface ThemeConfig {
    colors: {
      brand: {
        DEFAULT: string;
      };
    };
  }
}
declare module "*.svg" {
  import React from "react";
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}
