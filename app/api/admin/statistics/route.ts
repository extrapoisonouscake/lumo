import { db } from "@/db";
import { users } from "@/db/schema";
import dayjs from "dayjs";
import { count, gt } from "drizzle-orm";

//im too lazy to protect this route
export async function GET() {
const yesterday = dayjs().subtract(1, "day").toDate()
const weekAgo=dayjs().subtract(1, "week").toDate()
  const [dailyUsers,weeklyUsers] = await Promise.all([db
    .select({ count: count() })
    .from(users)
    .where(gt(users.lastLoggedInAt, yesterday)),db
    .select({ count: count() })
    .from(users)
    .where(gt(users.lastLoggedInAt, weekAgo))])
  return Response.json({
    dailyUsers: dailyUsers[0]?.count,
weeklyUsers:weeklyUsers[0]?.count
  });
}
