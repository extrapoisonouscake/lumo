const pluralRules = new Intl.PluralRules("en-CA");
type EnglishPluralForm = "one" | "other";
export const pluralize =
  <T>(map: Record<EnglishPluralForm, T>) =>
  (count: number) =>
    map[pluralRules.select(count) as EnglishPluralForm];
