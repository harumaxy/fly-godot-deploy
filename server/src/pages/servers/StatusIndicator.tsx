import { servers } from "@/db/schema";

export type ServerStatus = (typeof servers.status.enumValues)[number];
type Props = {
  status: ServerStatus;
  server_id: number;
};

export function StatusIndicator({ status, server_id }: Props) {
  const item =
    status === "started" ? (
      <span class="text-green-500">started</span>
    ) : status === "stopped" ? (
      <span class="text-yellow-500">stopped</span>
    ) : (
      <LoadingSpinner server_id={server_id} status={status} />
    );
  return <div class="flex justify-center items-center">{item}</div>;
}

function LoadingSpinner({ server_id, status }: Props) {
  return (
    <div
      hx-get={`/servers/${server_id}/polling`}
      hx-target={`#server_id_${server_id}`}
      hx-trigger="every 2s"
      hx-swap="outerHTML"
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
