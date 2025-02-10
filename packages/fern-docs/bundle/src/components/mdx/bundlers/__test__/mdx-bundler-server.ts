import express from "express";
import { Server } from "http";
import { fileURLToPath } from "url";
import { ViteDevServer, createServer } from "vite";
import { z } from "zod";

import { FernDocs } from "@fern-api/fdr-sdk";

import { serializeMdx } from "../mdx-bundler";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const bodySchema = z.object({
  content: z.string(),
  options: z.object({
    filename: z.string().optional(),
    files: z.record(z.string(), z.string()).optional(),
  }),
});

export async function setupTestServer() {
  const app = express();
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    root: __dirname,
    configFile: false,
  });

  app.use(vite.middlewares);

  app.use(async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }
    try {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", async () => {
        const content = bodySchema.parse(JSON.parse(body));
        const result = await serializeMdx(content.content, {
          files: content.options.files,
          filename: content.options.filename,
          options: {
            development: true,
          },
        });
        res.header("Content-Type", "application/json");
        res.end(JSON.stringify(result));
      });
    } catch (error) {
      res
        .status(500)
        .send(error instanceof Error ? error.message : "Unknown error");
    }
  });

  const server = app.listen(3000, () => {
    console.log("Test server listening on port 3000");
  });

  return { vite, server };
}

export async function teardownTestServer({
  vite,
  server,
}: {
  vite: ViteDevServer;
  server: Server;
}) {
  await vite.close();
  server.close();
}

export async function invokeTestServer(
  body: z.infer<typeof bodySchema>
): Promise<string | FernDocs.ResolvedMdx> {
  const response = await fetch(`http://localhost:3000`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}
