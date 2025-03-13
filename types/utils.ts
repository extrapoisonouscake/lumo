export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
// ... existing code ...

type Split<S extends string> = S extends `${infer T}.${infer U}` ? [T, U] : [S];

type DeepNonNullable<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

export type DeepWithRequired<T, P extends string> = Split<P> extends [
  infer First,
  infer Rest
]
  ? First extends keyof T
    ? Rest extends string
      ? DeepNonNullable<{
          [K in keyof T]: K extends First
            ? DeepWithRequired<NonNullable<T[K]>, Rest>
            : T[K];
        }>
      : T
    : T
  : P extends keyof T
  ? DeepNonNullable<{ [K in keyof T]: K extends P ? NonNullable<T[K]> : T[K] }>
  : T;
export const zodEnum = <T>(arr: T[]): [T, ...T[]] => arr as [T, ...T[]];
export type PickByKeys<T, K extends (keyof T)[]> = {
  [P in K[number]]: T[P];
};
export type NonUndefined<T> = Exclude<T, undefined>;
