import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import { AuthUtilsImpl } from "./AuthUtils";
import { S3UtilsImpl } from "./S3Utils";
import { getConfig } from "./config";
import { register } from "./generated";
import { getReadApiService } from "./services/api/getApiReadService";
import { getRegisterApiService } from "./services/api/getRegisterApiService";
import { getDocsReadService } from "./services/docs/getDocsReadService";
import { getDocsWriteService } from "./services/docs/getDocsWriteService";

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
        const s3Utils = new S3UtilsImpl(config);

        app.use(express.json({ limit: "50mb" }));
        register(app, {
            docs: {
                v1: {
                    read: getDocsReadService(prisma, s3Utils),
                    write: getDocsWriteService(prisma, authUtils, s3Utils),
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
