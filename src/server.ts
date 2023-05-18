import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import { AuthUtilsImpl } from "./AuthUtils";
import { getConfig } from "./config";
import { register } from "./generated";
import { getReadApiService } from "./services/getApiReadService";
import { getDocsReadService } from "./services/getDocsReadService";
import { getDocsWriteService } from "./services/getDocsWriteService";
import { getRegisterApiService } from "./services/getRegisterApiService";

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

        app.use(express.json({ limit: "50mb" }));
        register(app, {
            docs: {
                v1: {
                    read: getDocsReadService(prisma),
                    write: getDocsWriteService(prisma, authUtils),
                },
            },
            api: {
                v1: {
                    read: getReadApiService(prisma),
                    register: getRegisterApiService(prisma, authUtils),
                },
            },
        });

        console.log(`Listening for requests on port ${PORT}`);
        app.listen(PORT);
    } catch (e) {
        console.error("Server failed to start...", e);
    }
}
