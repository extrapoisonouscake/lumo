import { UserSetting } from "@/types/core";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { useUpdateGenericUserSetting } from "./use-update-generic-user-setting";

export function useDebouncedUpdateGenericUserSetting(key: UserSetting) {
  const [pendingValue, setPendingValue] = useState<{
    value: any;
    resolve?: (value: any) => void;
    reject?: (value: any) => void;
  } | null>(null);
  const [debouncedValue] = useDebounce(pendingValue, 1000);
  const updateUserSettingMutation = useUpdateGenericUserSetting();

  useEffect(() => {
    if (!debouncedValue) return;

    updateUserSettingMutation
      .mutateAsync({
        key,
        value: debouncedValue.value,
      })
      .then(() => {
        debouncedValue.resolve?.(debouncedValue.value);
      })
      .catch((e) => {
        debouncedValue.reject?.(e);
      })
      .finally(() => {
        setPendingValue(null);
      });
  }, [debouncedValue, key]);

  return {
    mutate: (value: any) => {
      setPendingValue((prev) => ({
        value,
      }));
    },
    mutateAsync: (value: any) => {
      return new Promise((resolve, reject) => {
        setPendingValue({
          value,
          resolve,
          reject,
        });
      });
    },
    isPending: !!pendingValue,
  };
}
