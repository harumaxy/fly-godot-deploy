// https://bun.sh/docs/runtime/hot
// https://github.com/elysiajs/elysia/issues/125#issuecomment-1716994577
import Elysia, { ListenCallback } from "elysia";
import { ElysiaWS } from "elysia/dist/ws";
import open from "open";
import { App } from ".";
import { ServerWebSocket } from "bun";

declare global {
  var devWS: ElysiaWS<any, any, any>;
  var isOpened: boolean;
}

const nextDevPageStatus = globalThis.isOpened ? "reloaded" : "opened";

export async function dev(app: App) {
  // build tailwind
  await Bun.spawn(["bun", "tw:build"]).exited;

  // listen dev websocket
  app.ws(`/live-reload`, {
    open: (ws_) => {
      console.log(`dev page is ${nextDevPageStatus}`);
      globalThis.devWS = ws_;
    },
  });

  // open window & send reload script if devWS is connected
  const afterListen: ListenCallback = async ({ hostname, port }) => {
    if (!globalThis.isOpened) {
      await open(`http://${hostname}:${port}`);
      globalThis.isOpened = true;
    }

    await globalThis.devWS?.send(
      <script id="live-reload"> window.location.reload(); </script>
    );
  };

  app.listen(3000, afterListen);
}
