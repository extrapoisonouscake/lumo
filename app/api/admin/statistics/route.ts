import { db } from "@/db";
import { users } from "@/db/schema";
import dayjs from "dayjs";
import { count, gt } from "drizzle-orm";

//im too lazy to protect this route
export async function GET() {
  const dailyUsers = await db
    .select({ count: count() })
    .from(users)
    .where(gt(users.lastLoggedInAt, dayjs().subtract(1, "day").toDate()));
  return Response.json({
    dailyUsers: dailyUsers[0]?.count,
  });
}
