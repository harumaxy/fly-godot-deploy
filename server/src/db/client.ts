import Database from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const sqlite = new Database(process.env.SQLITE_PATH || "", { create: true });

export const db = drizzle(sqlite, { schema });
