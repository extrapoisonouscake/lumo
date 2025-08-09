import { UserSettings } from "@/types/core";

export const INTERNAL_DATE_FORMAT = "YYYY-MM-DD";
export const USER_SETTINGS_COOKIE_PREFIX = "settings";

export enum Widgets {
  ANNOUNCEMENTS = "announcements",
  RECENT_GRADES = "recent_grades",
  OVERDUE_ASSIGNMENTS = "overdue_assignments",
  UPCOMING_ASSIGNMENTS = "upcoming_assignments",
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
  [Widgets.ANNOUNCEMENTS]: {
    showPdfButton?: boolean;
    maxItems?: number;
  };
  [Widgets.RECENT_GRADES]: {
    subjectId?: string;
    showLetterGrades?: boolean;
    daysBack?: number;
  };
  [Widgets.OVERDUE_ASSIGNMENTS]: {
    subjectId?: string;
    urgencyThreshold?: number; // days
  };
  [Widgets.UPCOMING_ASSIGNMENTS]: {
    subjectId?: string;
    daysAhead?: number;
  };
  [Widgets.SCHEDULE_TODAY]: {
    showRoomNumbers?: boolean;
    showTeacherNames?: boolean;
  };
  [Widgets.ATTENDANCE_SUMMARY]: {
    termId?: string;
    showPercentages?: boolean;
  };
};

export type WidgetGridItem = {
  id: string;
  type: Widgets;
  width: number;
  height: number;
  custom?: WidgetCustomProps[Widgets];
};

export type WidgetsConfiguration = WidgetGridItem[];

// Define which widgets support customization
export const WIDGET_CUSTOMIZATION_OPTIONS: Record<Widgets, boolean> = {
  [Widgets.ANNOUNCEMENTS]: true,
  [Widgets.RECENT_GRADES]: true,
  [Widgets.OVERDUE_ASSIGNMENTS]: true,
  [Widgets.UPCOMING_ASSIGNMENTS]: true,
  [Widgets.SCHEDULE_TODAY]: true,
  [Widgets.ATTENDANCE_SUMMARY]: false, // Simple widget, no customization needed
};
// Default custom values for each widget type
export const WIDGET_CUSTOM_DEFAULTS: WidgetCustomProps = {
  [Widgets.ANNOUNCEMENTS]: {
    showPdfButton: true,
    maxItems: 5,
  },
  [Widgets.RECENT_GRADES]: {
    subjectId: undefined, // All subjects/
    showLetterGrades: false,
    daysBack: 30,
  },
  [Widgets.OVERDUE_ASSIGNMENTS]: {
    subjectId: undefined, // All subjects
    urgencyThreshold: 7,
  },
  [Widgets.UPCOMING_ASSIGNMENTS]: {
    subjectId: undefined, // All subjects
    daysAhead: 14,
  },
  [Widgets.SCHEDULE_TODAY]: {
    showRoomNumbers: true,
    showTeacherNames: false,
  },
  [Widgets.ATTENDANCE_SUMMARY]: {
    termId: undefined, // Current term
    showPercentages: true,
  },
};

// Define max dimensions for each widget type
export const WIDGET_MAX_DIMENSIONS: Record<
  Widgets,
  { width: number; height: number }
> = {
  [Widgets.ANNOUNCEMENTS]: { width: 3, height: 3 },
  [Widgets.RECENT_GRADES]: { width: 2, height: 2 },
  [Widgets.OVERDUE_ASSIGNMENTS]: { width: 2, height: 2 },
  [Widgets.UPCOMING_ASSIGNMENTS]: { width: 2, height: 2 },
  [Widgets.SCHEDULE_TODAY]: { width: 3, height: 3 },
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
      width: 3,
      height: 2,
      custom: WIDGET_CUSTOM_DEFAULTS[Widgets.ANNOUNCEMENTS],
    },
    {
      id: "recent-grades-1",
      type: Widgets.RECENT_GRADES,
      width: 2,
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
      width: 2,
      height: 1,
      custom: WIDGET_CUSTOM_DEFAULTS[Widgets.SCHEDULE_TODAY],
    },
  ],
};
export const isDevelopment = process.env.NODE_ENV === "development";
