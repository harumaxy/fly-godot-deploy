/// <reference types="@kitajs/html/htmx.d.ts" />

import { db } from "@/db/client";
import { servers as serversTbl } from "@/db/schema";
import { Context, Elysia, t } from "elysia";
import { and, eq, like } from "drizzle-orm";
import { Layout } from "@/component/Layout";
import { TableRow } from "./TableRow";
import { TableHeader } from "./TableHeader";
import { ServerStatus } from "./StatusIndicator";
import { TextInput } from "@/component/TextInput";
import { Api as FlyAPI } from "@/fly/machine-api";
import { machineConfig } from "@/utils/machine";

const fly = new FlyAPI({
  baseApiParams: {
    format: "json",
    headers: {
      Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
    },
  },
});

const pathIdParam = { params: t.Object({ id: t.Number() }) };
type PathIdParam = { params: { id: string } };

export const serversPlugin = new Elysia()
  .get("/", async (ctx) => ServerListPage(ctx))
  .group("/servers", (_group) =>
    _group
      .get("", (ctx) => ServerListPage(ctx))
      .get("/:id/polling", (ctx) => polling(ctx))
      .post("/create", (ctx) => createServer(ctx))
      .post("/:id/start", (ctx) => startServer(ctx))
      .post("/:id/stop", (ctx) => stopServer(ctx))
      .delete("/:id/delete", (ctx) => deleteServer(ctx))
  )
  .onError(async ({ code, error, set }) => {
    console.log("code", code);
    console.log("error", error);
    set.headers["HX-Retarget"] = "#error";
    set.headers["HX-Reswap"] = "outerHTML";
    return <div id="error">Some error</div>;
  });

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ServerListPage(ctx: Context) {
  const { machine_id, server_secret, max_players, status, port } = ctx.query;

  const sql = db.select().from(serversTbl);
  // filters
  if (machine_id) sql.where(like(serversTbl.fly_machine_id, `%${machine_id}%`));
  if (server_secret)
    sql.where(like(serversTbl.server_secret, `%${server_secret}%`));
  if (status) sql.where(eq(serversTbl.status, status as ServerStatus));
  if (max_players) sql.where(eq(serversTbl.max_players, Number(max_players)));

  const servers = await sql;

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
            <TextInput name="port" />
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
        <div id="error"></div>

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

function error(ctx: Context<{ params: any }>, msg: string) {
  ctx.set.status = "Internal Server Error";
  ctx.set.headers["HX-Retarget"] = "#error";
  ctx.set.headers["HX-Reswap"] = "outerHTML";
  return <div id="error">{msg}</div>;
}

function findServer(id: number) {
  return db
    .select()
    .from(serversTbl)
    .where(eq(serversTbl.id, id))
    .then((res) => res[0]);
}

async function createServer(ctx: Context<typeof pathIdParam>) {
  let isError = false;
  const result = await db.transaction(async (trx) => {
    const newServer = await trx
      .insert(serversTbl)
      .values({
        fly_machine_id: "",
        server_secret: Math.random().toString(36).substring(7),
        domain: `${process.env.FLY_APP_NAME}.fly.dev`,
        port: 0,
        status: "creating",
        last_updated: new Date(),
      })
      .returning({
        id: serversTbl.id,
      })
      .then((res) => res[0]);

    const {
      ok,
      data: newFlyMachine,
      status,
    } = await fly.apps.machinesCreate(process.env.FLY_APP_NAME!, {
      config: machineConfig(newServer.id),
    });
    if (!ok) {
      await trx.rollback();
      isError = true;
    }

    return await trx
      .update(serversTbl)
      .set({
        fly_machine_id: newFlyMachine.id,
        port: newFlyMachine.config?.services?.[0].ports?.[0].port,
      })
      .where(eq(serversTbl.id, newServer.id))
      .returning();
  });
  if (isError) {
    return error(ctx as any, "Failed to create server");
  }

  return <TableRow server={result[0]!} />;
}

async function startServer(ctx: Context<PathIdParam>) {
  const { id } = ctx.params;
  const server = await findServer(Number(id));
  if (!server) {
    return error(ctx as any, "Server not found");
  }

  await fly.apps.machinesStart(
    process.env.FLY_APP_NAME!,
    server.fly_machine_id
  );

  const updated = await db
    .update(serversTbl)
    .set({
      status: "starting",
      last_updated: new Date(),
    })
    .where(eq(serversTbl.id, Number(id)))
    .returning();

  return <TableRow server={updated[0]!} />;
}
async function stopServer(ctx: Context<PathIdParam>) {
  const { id } = ctx.params;
  const server = await findServer(Number(id));
  if (!server) {
    return error(ctx as any, "Server not found");
  }

  await fly.apps.machinesStop(
    process.env.FLY_APP_NAME!,
    server.fly_machine_id,
    {}
  );

  const result = await db
    .update(serversTbl)
    .set({
      status: "stopping",
      last_updated: new Date(),
    })
    .where(eq(serversTbl.id, Number(id)))
    .returning();
  return <TableRow server={result[0]!} />;
}

async function deleteServer(ctx: Context<PathIdParam>) {
  const { id } = ctx.params;
  const server = await findServer(Number(id));
  if (!server) {
    return error(ctx as any, "Server not found");
  }

  await fly.apps.machinesDelete(
    process.env.FLY_APP_NAME!,
    server.fly_machine_id
  );

  const result = await db
    .delete(serversTbl)
    .where(eq(serversTbl.id, Number(id)))
    .returning();

  return <></>;
}

async function polling(ctx: Context<PathIdParam>) {
  const { id } = ctx.params;
  const server = await findServer(Number(id));
  if (!server) {
    return error(ctx as any, "Server not found");
  }

  let res;
  try {
    res = await fly.apps.machinesShow(
      process.env.FLY_APP_NAME!,
      server.fly_machine_id
    );
  } catch (e) {
    console.log(e);
    const errored = await db
      .update(serversTbl)
      .set({
        status: "error",
        last_updated: new Date(),
      })
      .where(eq(serversTbl.id, Number(id)))
      .returning()
      .then((res) => res[0]!);

    return <TableRow server={errored} />;
  }

  // Update status
  if (res.data.state === "started" || res.data.state === "stopped") {
    const updated = await db
      .update(serversTbl)
      .set({
        status: res.data.state,
        last_updated: new Date(),
      })
      .where(eq(serversTbl.id, Number(id)))
      .returning()
      .then((res) => res[0]!);

    return <TableRow server={updated} />;
  } else {
    ctx.set.headers["HX-Reswap"] = "none";
    return <></>;
  }
}
