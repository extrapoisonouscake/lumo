import { ErrorCardProps } from "@/components/misc/error-card";
import { WidgetCustomProps, Widgets } from "@/constants/core";
import { ReactNode } from "react";
import { ResponsiveWidget } from "./widget-editor";

export const WIDGET_NAMES: Record<Widgets, string> = {
  [Widgets.ANNOUNCEMENTS]: "School Announcements",
  [Widgets.RECENT_GRADES]: "Recent Grades",
  [Widgets.OVERDUE_ASSIGNMENTS]: "Overdue Assignments",
  // [Widgets.NEW_ASSIGNMENTS]: "New Assignments",
  // [Widgets.DYNAMIC_ASSIGNMENTS]: "Dynamic Assignments",
  [Widgets.SCHEDULE_TODAY]: "Today's Schedule",
  [Widgets.ATTENDANCE_SUMMARY]: "Attendance Summary",
};

export type WidgetComponentProps<T extends Widgets = Widgets> =
  ResponsiveWidget<T> & {
    isEditing?: boolean;
    index: number;
    richError?: ErrorCardProps;
    isOverlay?: boolean;

    className?: string;
    containerClassName?: string;
  };

// For customizable widgets
export type WidgetWithCustomization<T extends Widgets> = {
  component: SimpleWidget;
  getCustomizationContent: WidgetCustomizationContentRenderer<T>;
};
export type WidgetCustomizationContentRenderer<T extends Widgets> = (
  initialValues: WidgetCustomProps[T],
  onSave: (values: WidgetCustomProps[T]) => void
) => ReactNode;
// For simple widgets
export type SimpleWidget = React.ComponentType<WidgetComponentProps>;

// Union type for all widget exports
export type WidgetExport = WidgetWithCustomization<any>;

// Type guard to check if widget supports customization
export function isCustomizableWidget(
  widget: WidgetExport
): widget is WidgetWithCustomization<any> {
  return (
    typeof widget === "object" &&
    "component" in widget &&
    "getCustomizationContent" in widget
  );
}

// Import widgets dynamically to avoid import errors during development
export const WIDGET_COMPONENTS: Record<Widgets, WidgetExport> = {
  [Widgets.ANNOUNCEMENTS]: require("./announcements-widget").default,
  [Widgets.RECENT_GRADES]: require("./recent-grades-widget").default,
  [Widgets.OVERDUE_ASSIGNMENTS]: require("./overdue-assignments-widget")
    .default,
  // [Widgets.NEW_ASSIGNMENTS]: require("./new-assignments-widget").default,
  // [Widgets.DYNAMIC_ASSIGNMENTS]: require("./dynamic-assignments-widget")
  //   .default,
  [Widgets.SCHEDULE_TODAY]: require("./schedule-today-widget").default,
  [Widgets.ATTENDANCE_SUMMARY]: require("./attendance-summary-widget").default,
};
