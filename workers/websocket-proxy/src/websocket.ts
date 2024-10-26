import { Request, Response, WebSocket, WebSocketPair } from "@cloudflare/workers-types";

async function handleSession(websocket: WebSocket) {
	let recievedHandshake = false;
	let forwardedWs: WebSocket | null = null;

	websocket.accept();

	async function connectToProxy(data: { url: string }) {
		if (!("url" in data)) {
			throw new Error("url is required");
		}

		const headers = {
			Upgrade: "websocket",
		};

		if ("headers" in data) {
			Object.assign(headers, data.headers);
		}

		const resp = await fetch(data.url.replace("wss://", "https://"), { headers });

		// Check if the server accepted the WebSocket connection
		if (resp.status !== 101) {
			throw new Error(resp.statusText);
		}

		// If the WebSocket handshake completed successfully, then the
		// response has a `webSocket` property.
		forwardedWs = resp.webSocket;
		if (!forwardedWs) {
			throw new Error("Server didn't accept WebSocket");
		}

		// Call accept() to indicate that you'll be handling the socket here
		// in JavaScript, as opposed to returning it on to a client.
		forwardedWs.accept();
		// eslint-disable-next-line no-console
		console.log("Forwarded WebSocket connected");

		websocket.send(JSON.stringify({ type: "handshake", status: "connected" }));

		forwardedWs.addEventListener("message", (msg) => {
			websocket.send(JSON.stringify({ type: "data", data: msg.data }));
		});

		forwardedWs.addEventListener("close", () => {
			// eslint-disable-next-line no-console
			console.log("Forwarded WebSocket closed");
			websocket.close(1000, "Forwarded WebSocket closed");
		});
	}

	websocket.addEventListener("message", async ({ data }) => {
		if (!recievedHandshake) {
			let parsedData;
			try {
				parsedData = JSON.parse(typeof data === "string" ? data : new TextDecoder().decode(data));
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error(e);
				websocket.close(1011, "Invalid JSON");
			}

			if (parsedData.type !== "handshake") {
				websocket.close(1011, "Expected handshake");
			}

			try {
				await connectToProxy(parsedData);
				recievedHandshake = true;
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error(e);
				websocket.close(1011, "Failed to connect to proxy: " + String(e));
			}
		} else if (forwardedWs) {
			forwardedWs.send(data);
		} else {
			websocket.close(1011, "No connection to proxy");
		}
	});

	websocket.addEventListener("close", async (evt) => {
		// Handle when a client closes the WebSocket connection
		// eslint-disable-next-line no-console
		console.log(evt);
		if (forwardedWs) {
			forwardedWs.close();
		}
	});
}

export const websocketHandler = async (request: Request): Promise<Response> => {
	const upgradeHeader = request.headers.get("Upgrade");
	if (upgradeHeader !== "websocket") {
		return new Response("400: Expected WebSocket", { status: 400 });
	}

	const [client, server] = Object.values(new WebSocketPair());
	await handleSession(server);

	return new Response(null, {
		status: 101,
		webSocket: client,
	});
};
