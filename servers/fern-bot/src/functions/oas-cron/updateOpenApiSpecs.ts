import { evaluateEnv } from "@libs/env";
import { handlerWrapper } from "@libs/handler-wrapper";
import { updateOpenApiSpecsInternal } from "./actions/updateOpenApiSpecs";

const updateOpenApiSpec = async (_event: unknown) => {
  console.debug(
    "Beginning scheduled run of `updateOpenApiSpec`, received event:",
    _event
  );
  const env = evaluateEnv();
  console.debug(
    "Environment evaluated, continuing to actual action execution."
  );
  return updateOpenApiSpecsInternal(env);
};

export const handler = handlerWrapper(updateOpenApiSpec);
