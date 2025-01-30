import { NonUndefined, PickByKeys } from "@/types/utils";
import { get, getAll } from "@vercel/edge-config";
interface EdgeConfig {
  announcementsUploadTrustedSenders: string[]; //emails
}
type EdgeConfigKey = keyof EdgeConfig;
type EdgeConfigFunctionOptions = NonUndefined<
  Parameters<typeof get | typeof getAll>[1]
>;
class EdgeConfigConnector {
  get<T extends EdgeConfigKey>(key: T, options?: EdgeConfigFunctionOptions) {
    return get(key, options) as Promise<NonUndefined<EdgeConfig[T]>>;
  }
  getAll<T extends EdgeConfigKey[]>(
    keys: T,
    options?: EdgeConfigFunctionOptions
  ) {
    return getAll<PickByKeys<EdgeConfig, T>>(keys, options);
  }
}
export const edgeConfig = new EdgeConfigConnector();
