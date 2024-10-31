export type TableColumnItem<Key = string> = { key: Key; label: string };
export interface ErrorComponentProps {
  error: Error & { digest?: string };
  reset: () => void;
}
