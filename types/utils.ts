export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type ExtractProperty<T, K extends PropertyKey> = T extends {
  [P in K]: infer V;
}
  ? V
  : never;
