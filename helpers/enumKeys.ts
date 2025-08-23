export function enumKeys<T extends object>(e: T) {
  const keys = Object.keys(e);
  console.log(keys);
  const isStringEnum = isNaN(Number(keys[0]));
  const result = isStringEnum ? keys : keys.slice(0, keys.length / 2);
  return result as T[keyof T][];
}
