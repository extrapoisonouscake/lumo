"use client";
import { PageDataProvider } from "@/components/layout/page-heading";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import {
  WidgetEditor,
  WidgetEditorSkeleton,
} from "./_components/widgets/widget-editor";

export default function Home() {
  const settings = useUserSettings(false);
  return (
    <PageDataProvider>
      {settings ? (
        <WidgetEditor configuration={settings.widgetsConfiguration} />
      ) : (
        <WidgetEditorSkeleton />
      )}
    </PageDataProvider>
  );
}
