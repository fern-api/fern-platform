import express from "express";
import { GrpcProxy } from "./app/GrpcProxy";
import { getConfig } from "./app/GrpcProxyConfig";
import { getGrpcProxyService } from "./controllers/getGrpcProxyService";
import { register } from "./generated/register";

const PORT = 8080;
const expressApp = express();
const app = new GrpcProxy(getConfig());

void startServer();

async function startServer(): Promise<void> {
    try {
        expressApp.use(express.json({ limit: "50mb" }));
        register(expressApp, {
            proxy: getGrpcProxyService(),
        });
        app.logger.info(`Listening for requests on port ${PORT}`);
        expressApp.listen(PORT);
    } catch (err) {
        app.logger.error("Failed to start express server", err);
    }
}
