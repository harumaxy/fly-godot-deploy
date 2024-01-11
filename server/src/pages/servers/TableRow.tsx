import { ServerStatus, StatusIndicator } from "@/pages/servers/StatusIndicator";
import { ToolTip } from "@/pages/servers/Tooltip";
import { servers as serversTbl } from "@/db/schema";
import { formatISO9075 } from "date-fns";
import { InferSelectModel } from "drizzle-orm";
type Props = {
  server: InferSelectModel<typeof serversTbl>;
};

export async function TableRow({ server }: Props) {
  return (
    <tr
      id={`server_row_${server.id}`}
      class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
    >
      {[
        server.id,
        server.fly_machine_id,
        server.server_secret,
        ["...", server.domain],

        server.port,
        server.max_players,
        server.status,
        formatISO9075(server.last_updated),
      ].map((value) => (
        <td class={"text-center"}>
          {(() => {
            if (
              [...(serversTbl.status.enumValues as string[])].includes(
                value as string
              )
            ) {
              return <StatusIndicator server={server} />;
            }
            if (value instanceof Array) {
              return <ToolTip values={value as [string, string]} />;
            }
            return <span class={"text-center"}>{value}</span>;
          })()}
        </td>
      ))}

      <td>
        <div class={"flex gap-2 justify-center"}>
          <button
            hx-post={`/servers/${server.id}/start`}
            hx-target={`#server_row_${server.id}`}
            hx-swap="outerHTML"
            hx-disabled-elt="this"
            class={`btn enabled:btn-green disabled:btn-disabled`}
            disabled={server.status !== "stopped"}
          >
            start
          </button>
          <button
            hx-post={`/servers/${server.id}/stop`}
            hx-target={`#server_row_${server.id}`}
            hx-swap="outerHTML"
            class={`btn enabled:btn-yellow disabled:btn-disabled`}
            disabled={server.status !== "started"}
          >
            stop
          </button>
          <button
            hx-delete={`/servers/${server.id}/delete`}
            hx-target={`#server_row_${server.id}`}
            hx-swap="delete"
            class={"btn btn-red"}
          >
            destroy
          </button>
        </div>
      </td>
    </tr>
  );
}
