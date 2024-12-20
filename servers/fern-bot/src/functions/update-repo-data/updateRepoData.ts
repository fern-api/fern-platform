import { evaluateEnv } from "@libs/env";
import { handlerWrapper } from "@libs/handler-wrapper";
import { updateRepoDataInternal } from "./actions/updateRepoData";

const updateRepoData = async (event: unknown) => {
  console.debug(
    "Beginning scheduled run of `updateRepoData`, received event:",
    event
  );
  const env = evaluateEnv();
  console.debug(
    "Environment evaluated, continuing to actual action execution."
  );
  return updateRepoDataInternal(env);
};

export const handler = handlerWrapper(updateRepoData);
