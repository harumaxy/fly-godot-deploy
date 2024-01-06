import Database from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

const sqlite = new Database(process.env.SQLITE_PATH || "", { create: true });

const db = drizzle(sqlite);

(async function main() {
  console.log("migration started...");
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("migration finished...");
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
