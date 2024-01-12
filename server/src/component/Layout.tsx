export function Layout(props: Html.PropsWithChildren<{ head?: JSX.Element }>) {
  return (
    <html>
      <head>
        {props.head}
        {/* Load htmx */}
        <script src="/htmx.org/dist/htmx.min.js" />
        <script src="/htmx.org/dist/ext/ws.js" />
        <script src="/htmx.org/dist/ext/response-targets.js" />
        {/* Load tailwindcss output */}
        <link href="/public/output.css" rel="stylesheet" />
      </head>
      <body>{props.children}</body>
      {/* In dev mode, enable hot reload */}
      {process.env.NODE_ENV === "development" && hotReloadScript}
    </html>
  );
}

const hotReloadScript = (
  <script id="live-reload" hx-ext="ws" ws-connect="/live-reload" />
);

/* 👆 is equivalent to:
  <script>
    const ws = new WebSocket("ws://localhost:3000/live-reload");
    ws.onmessage = function (event) {
      if (event.data === "live-reload") {
        window.location.reload();
      }
    };
  </script>
*/
