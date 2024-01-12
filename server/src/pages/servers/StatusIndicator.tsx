import { servers } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type ServerStatus = (typeof servers.status.enumValues)[number];
type Props = {
  server: InferSelectModel<typeof servers>;
};

export function StatusIndicator({ server }: Props) {
  const { status } = server;
  const item =
    status === "started" ? (
      <span class="text-green-500">started</span>
    ) : status === "stopped" ? (
      <span class="text-yellow-500">stopped</span>
    ) : status === "error" ? (
      <span class="text-red-500">error</span>
    ) : (
      <LoadingSpinner server={server} />
    );
  return (
    <div
      id={`status_indicator_${server.id}`}
      class="flex justify-center items-center"
    >
      {item}
    </div>
  );
}

function LoadingSpinner({ server: { id, status } }: Props) {
  return (
    <div
      hx-get={`/servers/${id}/polling`}
      hx-target={`#server_row_${id}`}
      hx-swap="outerHTML"
      // hx-trigger="load delay:2s"
      hx-trigger="every 2s"
      class={`animate-spin rounded-full h-6 w-6 border-b-4 ${
        status === "creating"
          ? "border-blue-500"
          : status === "starting"
          ? "border-green-500"
          : "border-yellow-500"
      }`}
    ></div>
  );
}
