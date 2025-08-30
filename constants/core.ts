import { UserSettings } from "@/types/core";

export const INTERNAL_DATE_FORMAT = "YYYY-MM-DD";
export const USER_SETTINGS_COOKIE_PREFIX = "settings";

export enum Widgets {
  ANNOUNCEMENTS = "announcements",
  RECENT_GRADES = "recent_grades",
  OVERDUE_ASSIGNMENTS = "overdue_assignments",
  // NEW_ASSIGNMENTS = "new_assignments",
  // DYNAMIC_ASSIGNMENTS = "dynamic_assignments",
  SCHEDULE_TODAY = "schedule_today",
  ATTENDANCE_SUMMARY = "attendance_summary",
}

export enum WidgetSize {
  SMALL = "1x1",
  WIDE = "2x1",
  EXTRA_WIDE = "3x1",
  TALL = "2x2",
  LARGE = "3x2",
  EXTRA_LARGE = "3x3",
}

// Custom properties for each widget type
export type WidgetCustomProps = {
  [Widgets.RECENT_GRADES]: {
    subjectId?: string;
  };
  [Widgets.OVERDUE_ASSIGNMENTS]: {
    subjectId?: string;
    shouldHideOnEmpty?: boolean;
  };
  // [Widgets.NEW_ASSIGNMENTS]: {
  //   subjectId?: string;
  // };
  // [Widgets.DYNAMIC_ASSIGNMENTS]: {
  //   subjectId?: string;
  // };
  [Widgets.ATTENDANCE_SUMMARY]: {
    subjectId?: string;
  };
  [Widgets.SCHEDULE_TODAY]: {};
  [Widgets.ANNOUNCEMENTS]: {};
};

export type WidgetGridItem<T extends Widgets = Widgets> = {
  id: string;
  type: T;
  width: number;
  height: number;
  custom?: WidgetCustomProps[T];
};

export type WidgetsConfiguration = WidgetGridItem[];

// Define which widgets support customization
export const WIDGET_CUSTOMIZATION_OPTIONS: Record<Widgets, boolean> = {
  [Widgets.ANNOUNCEMENTS]: true,
  [Widgets.RECENT_GRADES]: true,
  [Widgets.OVERDUE_ASSIGNMENTS]: true,
  // [Widgets.NEW_ASSIGNMENTS]: true,
  // [Widgets.DYNAMIC_ASSIGNMENTS]: true,
  [Widgets.SCHEDULE_TODAY]: false,
  [Widgets.ATTENDANCE_SUMMARY]: false, // Simple widget, no customization needed
};
// Default custom values for each widget type
export const WIDGET_CUSTOM_DEFAULTS: Partial<WidgetCustomProps> = {};

// Define max dimensions for each widget type
export const WIDGET_MAX_DIMENSIONS: Record<
  Widgets,
  { width: number; height: number }
> = {
  [Widgets.ANNOUNCEMENTS]: { width: 1, height: 1 },
  [Widgets.RECENT_GRADES]: { width: 2, height: 2 },
  [Widgets.OVERDUE_ASSIGNMENTS]: { width: 2, height: 2 },
  // [Widgets.NEW_ASSIGNMENTS]: { width: 2, height: 2 },
  // [Widgets.DYNAMIC_ASSIGNMENTS]: { width: 2, height: 2 },
  [Widgets.SCHEDULE_TODAY]: { width: 2, height: 1 },
  [Widgets.ATTENDANCE_SUMMARY]: { width: 2, height: 1 },
};

// Convert size to grid dimensions
export const SIZE_TO_GRID: Record<WidgetSize, { cols: number; rows: number }> =
  {
    [WidgetSize.SMALL]: { cols: 1, rows: 1 },
    [WidgetSize.WIDE]: { cols: 2, rows: 1 },
    [WidgetSize.EXTRA_WIDE]: { cols: 3, rows: 1 },
    [WidgetSize.TALL]: { cols: 2, rows: 2 },
    [WidgetSize.LARGE]: { cols: 3, rows: 2 },

    [WidgetSize.EXTRA_LARGE]: { cols: 3, rows: 3 },
  };

// Convert width/height to WidgetSize enum
export function dimensionsToSize(width: number, height: number): WidgetSize {
  // Find matching size based on width and height
  for (const [size, { cols, rows }] of Object.entries(SIZE_TO_GRID)) {
    if (cols === width && rows === height) {
      return size as WidgetSize;
    }
  }

  return WidgetSize.SMALL;
}

export const USER_SETTINGS_KEYS = [
  "schoolId",
  "shouldShowNextSubjectTimer",
  "shouldShowPercentages",
  "shouldHighlightMissingAssignments",
  "shouldShowLetterGrade",
  "themeColor",
  "widgetsConfiguration",
] as const satisfies Array<keyof UserSettings>;
//TODO change type to ensure all keys are included
export const USER_SETTINGS_DEFAULT_VALUES = {
  shouldShowNextSubjectTimer: true,
  shouldShowPercentages: true,
  shouldHighlightMissingAssignments: true,
  shouldShowLetterGrade: false,
  themeColor: "162 23% 49%",
  widgetsConfiguration: [
    {
      id: "announcements-1",
      type: Widgets.ANNOUNCEMENTS,
      width: 1,
      height: 1,
      custom: WIDGET_CUSTOM_DEFAULTS[Widgets.ANNOUNCEMENTS],
    },
    {
      id: "recent-grades-1",
      type: Widgets.RECENT_GRADES,
      width: 1,
      height: 1,
      custom: WIDGET_CUSTOM_DEFAULTS[Widgets.RECENT_GRADES],
    },
    {
      id: "overdue-assignments-1",
      type: Widgets.OVERDUE_ASSIGNMENTS,
      width: 1,
      height: 1,
      custom: WIDGET_CUSTOM_DEFAULTS[Widgets.OVERDUE_ASSIGNMENTS],
    },
    {
      id: "schedule-today-1",
      type: Widgets.SCHEDULE_TODAY,
      width: 1,
      height: 1,
      custom: WIDGET_CUSTOM_DEFAULTS[Widgets.SCHEDULE_TODAY],
    },
  ],
};
export const isDevelopment = process.env.NODE_ENV === "development";
