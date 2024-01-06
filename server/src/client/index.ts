import { edenTreaty } from "@elysiajs/eden";
import type { App } from "../index";

const client = edenTreaty<App>("http://localhost:3000");

const { data, error } = await client.servers.post({
  name: "hello",
});

console.log(data, error);
