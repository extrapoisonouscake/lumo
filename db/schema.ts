import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { InferSelectModel, relations, sql } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table, unique } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
export const users = table(
  "users",
  {
    id: t.text("id").primaryKey(), //user student id
    username: t.text().unique(), //encrypted
    password: t.text(), //encrypted
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
export const usersRelations = relations(users, ({ many }) => ({
  notifications_subscriptions: many(notifications_subscriptions),
  tracked_subjects: many(tracked_subjects),
}));
export const user_settings = table("user_settings", {
  id: t.uuid().defaultRandom().primaryKey(),
  userId: t
    .text("user_id")
    .references(() => users.id)
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

export type UserSettingsSelectModel = InferSelectModel<typeof user_settings>;
export const notifications_settings = table("notifications_settings", {
  id: t.uuid().defaultRandom().primaryKey(),
  userId: t
    .text("user_id")
    .references(() => users.id)
    .unique(),
  newAssignments: t.boolean("new_assignments").notNull().default(true),
});

export const notifications_subscriptions = table(
  "notifications_subscriptions",
  {
    id: t.uuid().defaultRandom().primaryKey(),
    userId: t
      .text("user_id")
      .references(() => users.id)
      .unique()
      .notNull(),
    endpointUrl: t.text("endpoint_url").unique().notNull(),
    deviceId: t.text("device_id").unique().notNull(),
    publicKey: t.text("public_key").notNull(),
    authKey: t.text("auth_key").notNull(),
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
    lastSeenAt: t.timestamp("last_seen_at").defaultNow().notNull(),
  }
);
export const notifications_subscriptionsRelations = relations(
  notifications_subscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [notifications_subscriptions.userId],
      references: [users.id],
    }),
  })
);
export type NotificationsSubscriptionSelectModel = InferSelectModel<
  typeof notifications_subscriptions
>;
export const notificationSubscriptionSchema = createSelectSchema(
  notifications_subscriptions
);
export const tracked_subjects = table(
  "tracked_subjects",
  {
    id: t.uuid().defaultRandom().primaryKey(),
    userId: t
      .text("user_id")
      .references(() => users.id)
      .notNull(),
    subjectId: t.text("subject_id").notNull(),
    lastAssignmentId: t.text("last_assignment_id").notNull(),
    updatedAt: t.timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    tracked_subjects_user_id_subject_id_uniqueConstraint: unique(
      "tracked_subjects_user_id_subject_id_uniqueConstraint"
    ).on(t.userId, t.subjectId),
  })
);
export type TrackedSubjectSelectModel = InferSelectModel<
  typeof tracked_subjects
>;
export const tracked_subjectsRelations = relations(
  tracked_subjects,
  ({ one }) => ({
    user: one(users, {
      fields: [tracked_subjects.userId],
      references: [users.id],
    }),
  })
);
