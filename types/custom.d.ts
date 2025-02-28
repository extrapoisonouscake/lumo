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
