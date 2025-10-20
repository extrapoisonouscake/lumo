import { isProduction } from "@/constants/core";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
type DB = PostgresJsDatabase<typeof schema>;
declare global {
  // eslint-disable-next-line no-var -- only var works here
  var db: DB | undefined;
}

let db: DB;

if (isProduction) {
  db = drizzle(process.env.DATABASE_URL!, { schema });
} else {
  if (!global.db) global.db = drizzle(process.env.DATABASE_URL!, { schema });

  db = global.db;
}

export { db };
