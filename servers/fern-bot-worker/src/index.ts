import SmeeClient from "smee-client";
import { updateOpenApiSpecs } from "./actions/updateOpenApiSpecs";
import { Env } from "./env";
import { handleIncomingRequest } from "./github/octokitHooks";

if (process.env.NODE_ENV !== "production") {
    const smee = new SmeeClient({
        source: "https://smee.io/3DXoSvCO2NH87w8e",
        target: "http://localhost:3000/events",
        logger: console,
    });

    smee.start();
}

const Worker = {
    async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
        console.log("Processing incoming request.");
        return handleIncomingRequest(request, env);
    },

    async scheduled(_controller: ScheduledController, _env: Env, _ctx: ExecutionContext): Promise<void> {
        console.log("Processing scheduled run.");
        await updateOpenApiSpecs(_env);
    },
};

export default Worker;
