import { evaluateEnv } from "@libs/env";
import { handlerWrapper } from "@libs/handler-wrapper";
import { RepoData } from "@libs/schemas";
import { updateOpenApiSpecInternal } from "./actions/updateOpenApiSpec";

const updateOpenApiSpec = async (event: unknown) => {
  console.debug(
    "Beginning scheduled run of `updateOpenApiSpecs`, received event:",
    event
  );
  const env = evaluateEnv();
  console.debug(
    "Environment evaluated, continuing to actual action execution."
  );
  return updateOpenApiSpecInternal(env, event as RepoData);
};

export const handler = handlerWrapper(updateOpenApiSpec);
