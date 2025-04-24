import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
export const users = table(
  "users",
  {
    hashedId: t.text("hashed_id").primaryKey(),
    username: t.text().unique(),
    password: t.text(),
  },
  (table) => {
    return [
      t.check(
        "username_password_check",
        sql`(${table.username} IS NULL AND ${table.password} IS NULL) OR (${table.username} IS NOT NULL AND ${table.password} IS NOT NULL)`
      ),
    ];
  }
);
export const user_settings = table("user_settings", {
  id: t.uuid().defaultRandom().primaryKey(),
  hashedId: t
    .text("hashed_id")
    .references(() => users.hashedId)
    .unique(),
  updatedAt: t.timestamp("updated_at").defaultNow(),
  schoolId: t.text("school_id"),
  shouldShowNextSubjectTimer: t
    .boolean("should_show_next_subject_timer")
    .notNull()
    .default(USER_SETTINGS_DEFAULT_VALUES.shouldShowNextSubjectTimer),
  shouldShowPercentages: t
    .boolean("should_show_percentages")
    .notNull()
    .default(USER_SETTINGS_DEFAULT_VALUES.shouldShowPercentages),
  shouldHighlightMissingAssignments: t
    .boolean("should_highlight_missing_assignments")
    .notNull()
    .default(USER_SETTINGS_DEFAULT_VALUES.shouldHighlightMissingAssignments),
  shouldShowLetterGrade: t
    .boolean("should_show_letter_grade")
    .notNull()
    .default(USER_SETTINGS_DEFAULT_VALUES.shouldShowLetterGrade),
  themeColor: t
    .text("theme_color")
    .notNull()
    .default(USER_SETTINGS_DEFAULT_VALUES.themeColor),
});
export const recent_school_data = table("recent_school_data", {
  id: t.uuid().defaultRandom().primaryKey(),
  hashedId: t
    .text("hashed_id")
    .references(() => users.hashedId)
    .unique(),
  assignments: t.jsonb(),
});
