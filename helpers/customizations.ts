import { db } from "@/db";
import { tracked_school_data } from "@/db/schema";
import { eq } from "drizzle-orm";
export const getTrackedSchoolData = async (studentDatabaseId: string) => {
  return db.query.tracked_school_data.findFirst({
    where: eq(tracked_school_data.userId, studentDatabaseId),
  });
};
