import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import * as usersAPI from "@/pages/users";
import { serversPlugin } from "@/pages/servers/page";
import { html } from "@elysiajs/html";

import staticPlugin from "@elysiajs/static";

import { dev } from "./dev";

// apply routes
const app = new Elysia()
  .use(swagger())
  .use(html())
  .use(staticPlugin())
  .get("/htmx.org/dist/*", ({ request, set }) => {
    const path = new URL(request.url).pathname;
    set.headers["Content-Type"] = "text/javascript";
    set.headers["Cache-Control"] = "public, max-age=31536000, immutable"; // 1 year
    return Bun.file(`node_modules/${path}`);
  })
  .use(serversPlugin)
  .get("/users", () => usersAPI.GET());

if (process.env.NODE_ENV === "development") {
  // dev mode
  await dev(app);
} else {
  // prod mode
  app.listen(3000);
}

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
