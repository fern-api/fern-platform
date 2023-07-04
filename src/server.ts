import cors from "cors";
import express from "express";
import { FdrApplication, getConfig } from "./app";
import { registerBackgroundTasks } from "./background";
import { getReadApiService } from "./controllers/api/getApiReadService";
import { getRegisterApiService } from "./controllers/api/getRegisterApiService";
import { getDocsReadService } from "./controllers/docs/getDocsReadService";
import { getDocsReadV2Service } from "./controllers/docs/getDocsReadV2Service";
import { getDocsWriteService } from "./controllers/docs/getDocsWriteService";
import { getDocsWriteV2Service } from "./controllers/docs/getDocsWriteV2Service";
import { register } from "./generated";

const PORT = 8080;

void main();

async function main() {
    try {
        const config = getConfig();

        const expressApp = express();

        expressApp.use(cors());

        expressApp.get("/health", (_req, res) => {
            res.sendStatus(200);
        });

        const app = new FdrApplication(config);

        expressApp.use(express.json({ limit: "50mb" }));
        register(expressApp, {
            docs: {
                v1: {
                    read: {
                        _root: getDocsReadService(app),
                    },
                    write: {
                        _root: getDocsWriteService(app),
                    },
                },
                v2: {
                    read: {
                        _root: getDocsReadV2Service(app),
                    },
                    write: {
                        _root: getDocsWriteV2Service(app),
                    },
                },
            },
            api: {
                v1: {
                    read: {
                        _root: getReadApiService(app),
                    },
                    register: {
                        _root: getRegisterApiService(app),
                    },
                },
            },
        });

        registerBackgroundTasks(app);

        console.log(`Listening for requests on port ${PORT}`);
        expressApp.listen(PORT);
    } catch (e) {
        console.error("Server failed to start...", e);
    }
}
