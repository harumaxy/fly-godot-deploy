import { db } from "@/db/client";
import { users } from "@/db/schema";
import { and, eq, like, notIlike, notLike, or } from "drizzle-orm";

export async function GET() {
  const result = await db.query.users.findFirst({
    with: {
      profile: true,
      posts: true,
    },
  });
  return result;
}
