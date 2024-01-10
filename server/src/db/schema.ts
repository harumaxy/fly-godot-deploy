import { relations, sql } from "drizzle-orm";

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  full_name: text("full_name").notNull(),
  phone: text("phone", { length: 256 }),
});

export const servers = sqliteTable("servers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fly_machine_id: text("fly_machine_id").notNull(),
  status: text("status", {
    enum: [
      "stopped",
      "started",
      // in operation states
      "creating",
      "starting",
      "stopping",
      "destroying",
    ],
  }).notNull(),
  server_secret: text("server_secret").notNull(),
  domain: text("domain").notNull(),
  port: integer("port").notNull(),
  last_updated: integer("last_updated", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch(CURRENT_TIMESTAMP))`),
  max_players: integer("max_players").notNull().default(2),
});
