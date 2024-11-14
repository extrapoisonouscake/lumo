const lineBreaksRegex = /(\r\n|\n|\r)/gm;
export const removeLineBreaks = <T extends string | null | undefined>(str: T) =>
  str?.replace(lineBreaksRegex, "") as T extends string ? string : undefined;
