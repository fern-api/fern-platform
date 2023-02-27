import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import { AuthUtilsImpl } from "./AuthUtils";
import { getConfig } from "./config";
import { register } from "./generated";
import { getEnvironmentService } from "./services/environment";
import { getRegistryService } from "./services/registry";

const PORT = 8080;

void main();

async function main() {
    try {
        const config = getConfig();

        const app = express();

        app.use(cors());

        app.get("/health", (_req, res) => {
            res.sendStatus(200);
        });

        const prisma = new PrismaClient({
            log: ["info", "warn", "error"],
        });

        const authUtils = new AuthUtilsImpl(config);

        register(app, {
            registry: getRegistryService(prisma, authUtils),
            environment: getEnvironmentService(prisma, authUtils),
        });

        console.log(`Listening for requests on port ${PORT}`);
        app.listen(PORT);
    } catch (e) {
        console.error("Server failed to start...", e);
    }
}
