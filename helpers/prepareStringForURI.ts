export const prepareStringForURI = (string: string) =>
  string.replaceAll(/[\s\/]/g, "_");
