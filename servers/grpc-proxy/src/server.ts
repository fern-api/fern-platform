import express from "express";
import { GrpcProxy } from "./GrpcProxy";
import { register } from "./generated/api";

const PORT = 8080;
const expressApp = express();

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
