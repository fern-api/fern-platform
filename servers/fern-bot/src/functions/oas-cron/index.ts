import { handlerPath } from "@libs/handler-resolver";
import type { AWS } from "@serverless/typescript";

const handlerFunction: AWS["functions"][string] = {
    handler: `${handlerPath(__dirname)}/updateOpenApiSpec.handler`,
    events: [
        {
            schedule: {
                rate: ["cron(0 0 ? * * *)"],
                enabled: true,
            },
        },
    ],
};

export default handlerFunction;
