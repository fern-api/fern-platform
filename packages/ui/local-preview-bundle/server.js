const express = require("express");
const next = require("next");
const WebSocket = require("ws");

const expressApp = express();
const httpServer = require("http").createServer(expressApp);

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const nextApp = next({
    dev,
    hostname,
    port,
    customServer: true,
    httpServer,
    conf: {
        env: {
            PORT: port,
        },
    },
});
const nextHandle = nextApp.getRequestHandler();

const wss = new WebSocket.Server({ server: httpServer });

wss.on("connection", function connection(ws) {
    // every 5 seconds send a message to the client
    const interval = setInterval(() => {
        ws.send(JSON.stringify({ reload: true }));
    }, 5000);

    ws.on("close", function close() {
        clearInterval(interval);
    });
});

void nextApp
    .prepare()
    .then(() => {
        expressApp.post("/v2/registry/docs/load-with-url", async (_, res) => {
            const response = await fetch("https://registry.buildwithfern.com/v2/registry/docs/load-with-url", {
                method: "POST",
                body: JSON.stringify({ url: "fern.docs.buildwithfern.com" }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            res.json(await response.json());
        });

        expressApp.get("*", (req, res) => {
            if (req.headers.upgrade === "websocket") {
                return wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
                    wss.emit("connection", ws, req);
                });
            }
            return nextHandle(req, res);
        });

        expressApp.listen(port, (err) => {
            if (err) {
                throw err;
            }
            // eslint-disable-next-line no-console
            console.log(`> Ready on http://${hostname}:${port}`);
        });
    })
    .catch((ex) => {
        console.error(ex);
        process.exit(1);
    });
