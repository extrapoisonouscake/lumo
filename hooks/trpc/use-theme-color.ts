import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { trpc } from "@/views/trpc";
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
