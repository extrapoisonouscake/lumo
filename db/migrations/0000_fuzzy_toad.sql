CREATE TABLE "notifications_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"new_assignments" boolean DEFAULT true NOT NULL,
	CONSTRAINT "notifications_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "notifications_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"endpoint_url" text NOT NULL,
	"device_id" text NOT NULL,
	"public_key" text NOT NULL,
	"auth_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notifications_subscriptions_endpoint_url_unique" UNIQUE("endpoint_url"),
	CONSTRAINT "notifications_subscriptions_device_id_unique" UNIQUE("device_id")
);
--> statement-breakpoint
CREATE TABLE "tracked_school_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"subjects" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tracked_school_data_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"updated_at" timestamp DEFAULT now(),
	"school_id" text,
	"should_show_next_subject_timer" boolean DEFAULT true NOT NULL,
	"should_show_percentages" boolean DEFAULT true NOT NULL,
	"should_highlight_missing_assignments" boolean DEFAULT true NOT NULL,
	"should_show_letter_grade" boolean DEFAULT false NOT NULL,
	"theme_color" text,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text,
	"password" text,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "username_password_check" CHECK (("users"."username" IS NULL AND "users"."password" IS NULL) OR ("users"."username" IS NOT NULL AND "users"."password" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "notifications_settings" ADD CONSTRAINT "notifications_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications_subscriptions" ADD CONSTRAINT "notifications_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracked_school_data" ADD CONSTRAINT "tracked_school_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;