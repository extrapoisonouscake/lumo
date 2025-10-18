export const prepareThemeColor = (themeColor: string) => {
  return `hsl(${themeColor})`;
};
export const setThemeColorCSSVariable = (themeColor: string) => {
  (document.querySelector(":root") as HTMLElement).style.setProperty(
    "--brand",
    themeColor
  );
};
