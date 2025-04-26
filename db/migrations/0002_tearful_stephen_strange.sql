ALTER TABLE "tracked_subjects" DROP CONSTRAINT "tracked_subjects_user_id_unique";--> statement-breakpoint
ALTER TABLE "tracked_subjects" ALTER COLUMN "user_id" SET NOT NULL;