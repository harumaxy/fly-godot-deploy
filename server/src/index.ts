import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import * as usersAPI from "@/api/users";

const createServerBody = t.Object({
  name: t.String(),
});

const app = new Elysia()
  .use(swagger())
  .get("/users", () => usersAPI.GET())
  .get("/servers", async () => {
    const result = await db.select().from(schema.servers);
    return result;
  })
  .post(
    "/servers",
    async ({ body: { name } }) => {
      const result = await db
        .insert(schema.servers)
        .values({ name, domain: `${name}.fly.dev`, last_updated: new Date() })
        .returning();
      return result;
    },
    {
      body: createServerBody,
    }
  )
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
