const lineBreaksRegex = /(\r\n|\n|\r)/gm;
export const removeLineBreaks = (str: string) =>
  str.replace(lineBreaksRegex, "");
