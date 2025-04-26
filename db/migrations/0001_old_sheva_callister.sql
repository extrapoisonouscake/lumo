CREATE TABLE "tracked_subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"subject_id" text NOT NULL,
	"last_assignment_id" text NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tracked_subjects_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DROP TABLE "recent_school_data" CASCADE;--> statement-breakpoint
ALTER TABLE "tracked_subjects" ADD CONSTRAINT "tracked_subjects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;