"use client";

import { PageDataProvider } from "@/components/layout/page-heading";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { WidgetEditor } from "./_components/widgets/widget-editor";

export default function Home() {
  const settings = useUserSettings();
  // useEffect(() => {
  //   const widgets = settings.widgetsConfiguration;
  //   const widgetIds = new Set(widgets.map((w) => w.id));
  //   if (widgetIds.has(Widgets.SCHEDULE_TODAY)) {
  //     queryClient.prefetchQuery(scheduleTodayWidget.getQueryKey());
  //   }
  // }, []);
  return (
    <PageDataProvider>
      <WidgetEditor configuration={settings.widgetsConfiguration} />
    </PageDataProvider>
  );
}
