import { DefinitionRegistryService } from "@fern-fern/fern-definition-registry-api-server/services";
import { PrismaClient } from "@prisma/client";
import express from "express";
import { initializeDirectories } from "./initializeDirectories";
import { getRegistryService } from "./services/registry";

void main();

async function main() {
  try {
    await initializeDirectories();
    console.log("Initialized Directories...");

    const app = express();
    app.get("/health", (_req, res) => {
      res.status(200).send("Ok");
    });

    const prisma = new PrismaClient({
      log: ["info", "warn", "error"],
    });
    app.use(
      DefinitionRegistryService.expressMiddleware(getRegistryService(prisma))
    );

    console.log("Listening for requests...");
    app.listen(8080);
  } catch (e) {
    console.error("Server failed to start...", e);
  }
}
