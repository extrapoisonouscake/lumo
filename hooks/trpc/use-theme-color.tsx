import { trpc } from "@/app/trpc";
import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { useQuery } from "@tanstack/react-query";

export function useThemeColor(initialThemeColor?: string) {
  const query = useQuery({
    ...trpc.core.settings.getSettings.queryOptions(),
    select: (data) => data.themeColor,
  });
  return (
    query.data ?? initialThemeColor ?? USER_SETTINGS_DEFAULT_VALUES.themeColor
  );
}
