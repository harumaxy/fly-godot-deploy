import { db } from "@/db/client";
import { servers } from "@/db/schema";
import { t } from "elysia";

async function GET() {
  db.select().from(servers);
}

interface CreateServerParam {}

async function createServer() {
  fetch(`${process.env.FLY_API_HOSTNAME}/v1/apps`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
      "content-type": "application/json",
    },
  });
}

async function startServer(machine_id: string) {
  const res = await fetch(
    `${process.env.FLY_API_HOSTNAME}/v1/apps/godot/machines/${machine_id}/start`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
        "content-type": "application/json",
      },
    }
  );
}
async function stopServer(machine_id: string) {
  const res = await fetch(
    `${process.env.FLY_API_HOSTNAME}/v1/apps/godot/machines/${machine_id}/stop`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
        "content-type": "application/json",
      },
    }
  );
}

async function deleteServer(machine_id: string) {
  const res = await fetch(
    `${process.env.FLY_API_HOSTNAME}/v1/apps/godot/machines/${machine_id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
        "content-type": "application/json",
      },
    }
  );
}
