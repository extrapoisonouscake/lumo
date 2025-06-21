ALTER TABLE "notifications_settings" DROP CONSTRAINT "notifications_settings_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications_subscriptions" DROP CONSTRAINT "notifications_subscriptions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tracked_school_data" DROP CONSTRAINT "tracked_school_data_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_settings" DROP CONSTRAINT "user_settings_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications_settings" ADD CONSTRAINT "notifications_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications_subscriptions" ADD CONSTRAINT "notifications_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracked_school_data" ADD CONSTRAINT "tracked_school_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;