const express = require("express");
const WebSocket = require("ws");
const path = require("path");

const expressApp = express();
const httpServer = require("http").createServer(expressApp);

const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below

const wss = new WebSocket.Server({ server: httpServer });

const connections = new Set();
wss.on("connection", function connection(ws) {
  connections.add(ws);

  ws.on("close", () => {
    connections.delete(ws);
  });
});

expressApp.post("/v2/registry/docs/load-with-url", async (_, res) => {
  const response = await fetch(
    "https://registry.buildwithfern.com/v2/registry/docs/load-with-url",
    {
      method: "POST",
      body: JSON.stringify({ url: "fern.docs.buildwithfern.com" }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FERN_TOKEN}`,
      },
    }
  );

  res.json(await response.json());
});

expressApp.get("/", (req, _res, next) => {
  if (req.headers.upgrade === "websocket") {
    return wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      wss.emit("connection", ws, req);
    });
  }
  return next();
});

expressApp.use("/_next", express.static(path.join(__dirname, "/out/_next")));

expressApp.use("*", async (_req, res) => {
  return res.sendFile(path.join(__dirname, "/out/[[...slug]].html"));
});

expressApp.listen(port, (err) => {
  if (err) {
    throw err;
  }

  console.log(`> Ready on http://${hostname}:${port}`);
});

// test reload
setInterval(() => {
  connections.forEach((ws) => {
    ws.send(
      JSON.stringify({
        version: 1,
        type: "startReload",
      })
    );
    setTimeout(() => {
      ws.send(
        JSON.stringify({
          version: 1,
          type: "finishReload",
        })
      );
    }, 1_000);
  });
}, 10_000);

// await infiinitely

// eslint-disable-next-line @typescript-eslint/no-empty-function
void new Promise(() => {});
