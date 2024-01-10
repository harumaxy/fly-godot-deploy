/// <reference types="@kitajs/html/htmx.d.ts" />

import { db } from "@/db/client";
import { servers as serversTbl } from "@/db/schema";
import { Elysia, t } from "elysia";
import { and, eq, isNotNull, like, or } from "drizzle-orm";
import { Layout } from "@/component/Layout";
import { TableRow } from "./TableRow";
import { TableHeader } from "./TableHeader";
import { ServerStatus } from "./StatusIndicator";
import { TextInput } from "@/component/TextInput";

export const serversPlugin = new Elysia()
  .get("/", async ({ query }) => ServerListPage({ ...query }))
  .get("/servers", ({ query }) => ServerListPage({ ...query }))
  .get("/servers/:id/polling", async ({ params }) => polling(Number(params.id)))
  .post("/servers/create", ({}) => createServer())
  .post("/servers/:id/start", ({ params }) => startServer(Number(params.id)))
  .post("/servers/:id/stop", ({ params }) => stopServer(Number(params.id)))
  .delete("servers/:id/delete", ({ params }) =>
    deleteServer(Number(params.id))
  );

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ServerListPage(props: {
  machine_id?: string;
  server_secret?: string;
  max_players?: number;
  status?: ServerStatus;
}) {
  const servers = await db
    .select()
    .from(serversTbl)
    .where(
      and(
        props.machine_id
          ? like(serversTbl.fly_machine_id, `%${props.machine_id}%`)
          : undefined,
        props.server_secret
          ? like(serversTbl.server_secret, `%${props.server_secret}%`)
          : undefined,
        props.status ? eq(serversTbl.status, props.status) : undefined,
        props.max_players
          ? eq(serversTbl.max_players, props.max_players)
          : undefined
      )
    );

  const nonce = Math.random().toString(36).substring(7);
  return (
    <Layout>
      <div class={"p-2 m-2"}>
        <h1 class={"text-8xl text-green-700"}>Manage Game Server</h1>
        <p class={"text-xl mt-l"}>nonce(update on reload): {nonce}</p>

        <form
          class={"border-zinc-500 border-solid border-2 p-4 m-4"}
          hx-get="/servers"
          hx-target="table"
          hx-select="table"
          hx-swap="outerHTML"
          hx-hx-swap-oob="true"
          hx-trigger="keyup changed delay:500ms from:#search-form,change from:#select-status"
        >
          <h2 class={"text-4xl mt-l pb-2"}>Filters</h2>
          <div class={"grid grid-cols-2 gap-2"}>
            <TextInput name="machine_id" />
            <TextInput name="server_secret" />
            <TextInput name="max_players" />
            <div>
              <label
                for="status"
                class={"block text-xl font-medium leading-6 text-gray-900"}
              >
                status
              </label>
              <div class="mt-2">
                <select id="select-status" name="status" class={"text-xl"}>
                  {["", ...serversTbl.status.enumValues].map((status) => (
                    <option value={status}>{status || "any"}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </form>

        <button
          hx-post="/servers/create"
          hx-target="tbody"
          hx-swap="beforeend"
          class={"btn btn-blue"}
        >
          new server
        </button>
        <div class={"mx-auto"}>
          <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <TableHeader />
            <tbody>
              {servers.map((server) => (
                <TableRow server={server} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

/*
  Server API 
*/

async function createServer() {
  const random = () => Math.random().toString(36).substring(7);
  const random_machine_id = random();
  const random_server_secret = random();
  const startPort = 5000;

  // await requestToFly("POST", "/apps");
  const result = await db.transaction(async (trx) => {
    const { id } = await trx
      .insert(serversTbl)
      .values({
        fly_machine_id: random_machine_id,
        server_secret: random_server_secret,
        domain: "godot-game-server-pool.fly.dev",
        port: startPort,
        status: "creating",
        last_updated: new Date(),
      })
      .returning({
        id: serversTbl.id,
      })
      .then((res) => res[0]);

    return await trx
      .update(serversTbl)
      .set({
        port: startPort + id,
      })
      .where(eq(serversTbl.id, id))
      .returning();
  });

  return <TableRow server={result[0]!} />;
}

async function startServer(id: number) {
  // requestToFly("POST", `/apps/godot/machines/${machine_id}/start`);
  const result = await db
    .update(serversTbl)
    .set({
      status: "starting",
      last_updated: new Date(),
    })
    .where(eq(serversTbl.id, id))
    .returning();
  return <TableRow server={result[0]!} />;
}
async function stopServer(id: number) {
  // requestToFly("POST", `/apps/godot/machines/${machine_id}/stop`);
  const result = await db
    .update(serversTbl)
    .set({
      status: "stopping",
      last_updated: new Date(),
    })
    .where(eq(serversTbl.id, id))
    .returning();
  return <TableRow server={result[0]!} />;
}

async function deleteServer(id: number) {
  // requestToFly("DELETE", `/apps/godot/machines/${machine_id}`);
  const result = await db
    .delete(serversTbl)
    .where(eq(serversTbl.id, id))
    .returning();
  return <TableRow server={result[0]!} />;
}

async function polling(id: number) {
  const server = await db
    .select()
    .from(serversTbl)
    .where(eq(serversTbl.id, id))
    .then((res) => res[0]!);

  // skip updating status randomly
  if (Math.random() < 0.5) {
    return <TableRow server={server} />;
  }

  // Update status
  const nextStatus =
    server.status === "creating" || server.status === "starting"
      ? "started"
      : server.status === "stopping"
      ? "stopped"
      : server.status;
  const updated = await db
    .update(serversTbl)
    .set({
      status: nextStatus,
      last_updated: new Date(),
    })
    .where(eq(serversTbl.id, id))
    .returning()
    .then((res) => res[0]!);

  return <TableRow server={updated} />;
}

const requestToFly = async (method: string, path: string, body?: any) => {
  const res = await fetch(`${process.env.FLY_API_HOSTNAME}/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
};
