import { relations, sql } from "drizzle-orm";

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  full_name: text("full_name").notNull(),
  phone: text("phone", { length: 256 }),
});

export const servers = sqliteTable(
  "servers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    domain: text("domain").notNull().unique(),
    last_updated: integer("last_updated", { mode: "timestamp" })
      .notNull()
      //sql
      .default(sql`(unixepoch(CURRENT_TIMESTAMP))`),
    max_players: integer("max_players").notNull().default(2),
  },
  (self) => ({})
);
