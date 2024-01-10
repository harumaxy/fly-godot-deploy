// https://bun.sh/docs/runtime/hot
// https://github.com/elysiajs/elysia/issues/125#issuecomment-1716994577
import Elysia, { ListenCallback } from "elysia";
import { ElysiaWS } from "elysia/dist/ws";
import open from "open";

declare global {
  var devWS: ElysiaWS<any, any, any>;
  var isAlreadyOpened: boolean;
}

const devPageStatus = globalThis.isAlreadyOpened ? "reloaded" : "opened";

export async function dev(app: Elysia<any, any, any, any, any, any, any>) {
  // build tailwind
  await Bun.spawn(["bun", "tw:build"]).exited;

  // listen dev websocket
  app.ws(`/live-reload`, {
    open: (ws_) => {
      console.log(`dev page is ${devPageStatus}`);
      globalThis.devWS = ws_;
    },
  });

  // open window & send reload script if devWS is connected
  const afterListen: ListenCallback = async ({ hostname, port }) => {
    if (!globalThis.isAlreadyOpened) {
      await open(`http://${hostname}:${port}`);
      globalThis.isAlreadyOpened = true;
    }

    await globalThis.devWS?.send(
      <script id="live-reload"> window.location.reload(); </script>
    );
  };

  app.listen(3000, afterListen);
}
