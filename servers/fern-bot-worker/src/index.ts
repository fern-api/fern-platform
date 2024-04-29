import { updateOpenApiSpecs } from "./actions/updateOpenApiSpecs";
import { Env } from "./env";
import { handleIncomingRequest } from "./github/octokitHooks";

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
