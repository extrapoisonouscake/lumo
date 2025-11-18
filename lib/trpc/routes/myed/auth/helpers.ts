export function parseCookiesFromSetCookieHeader(
  pairs: string[],
  filter?: (name: string) => boolean
) {
  let entries = pairs.map((pair) => (pair.split(";")[0] as string).split("="));
  if (filter) {
    entries = entries.filter(([name]) => filter(name!));
  }
  return Object.fromEntries(entries) as Record<string, string>;
}
