import { createServer, Server } from "http";
import next from "next";
import { parse } from "url";

export async function startNextServer(port: number): Promise<Server> {
  const dev = process.env.NODE_ENV !== "production";
  const hostname = "localhost";
  const app = next({
    dev,
    hostname,
    port,
    dir: __dirname,
    experimentalTestProxy: true,
    customServer: true,
  });
  const handle = app.getRequestHandler();

  await app.prepare();
  const server = createServer(async (req_1, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req_1.url!, true);
      await handle(req_1, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req_1.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });
  server.once("error", (err_1) => {
    console.error(err_1);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  return server;
}

export function getNextServerUrl(port: number) {
  return `http://localhost:${port}`;
}
