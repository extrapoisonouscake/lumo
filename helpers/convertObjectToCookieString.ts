export const convertObjectToCookieString = (
  obj: Record<string, string>,
  shouldInsertSpaces = true
) => {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join(`;${shouldInsertSpaces ? " " : ""}`);
};
