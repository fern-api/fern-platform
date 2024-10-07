import { createLambdaFunction, createProbot } from "@probot/adapter-aws-lambda-serverless";

import appFn from "./actionWrapper";

export const handler = createLambdaFunction(appFn, {
    probot: createProbot(),
});
