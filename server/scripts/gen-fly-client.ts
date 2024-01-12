import { generateApi } from "swagger-typescript-api";
import path from "node:path";

const spec = await fetch("https://docs.machines.dev/swagger/doc.json").then(
  (res) => res.json()
);

await generateApi({
  spec,
  output: path.resolve(process.cwd(), "./src/fly"),
  name: "machine-api",
  httpClientType: "fetch",
  generateClient: true,
  extractEnums: true,
  extractRequestBody: true,
  extractRequestParams: true,
  extractResponseBody: true,
  generateRouteTypes: true,
  generateResponses: true,
});
