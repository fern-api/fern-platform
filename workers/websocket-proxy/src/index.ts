import { ExportedHandler, Response } from "@cloudflare/workers-types";
import { websocketHandler } from "./websocket";

export default {
	async fetch(request, _env, _ctx): Promise<Response> {
		try {
			const url = new URL(request.url);
			switch (url.pathname) {
				case "/ws":
					return websocketHandler(request);
				default:
					return new Response("404: Not Found", { status: 404 });
			}
		} catch (err) {
			return new Response(String(err));
		}
	},
} satisfies ExportedHandler<Env>;
