export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type ReturnTypesOfMethods<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer R ? R : never;
}[keyof T];
export type ExtractProperty<T, K extends PropertyKey> = T extends {
  [P in K]: infer V;
}
  ? V
  : never;
