export const convertObjectToCookieString = (obj: Record<string, string>) => {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
};
