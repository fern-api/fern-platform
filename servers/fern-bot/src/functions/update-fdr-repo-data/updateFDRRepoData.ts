import { evaluateEnv } from "@libs/env";
import { handlerWrapper } from "@libs/handler-wrapper";
import { updateFDRRepoDataInternal } from "./actions/updateFDRRepoData";
import { RepoData } from "@libs/schemas";

const updateFDRRepoData = async (event: unknown) => {
  console.debug(
    "Beginning scheduled run of `updateFDRRepoData`, received event:",
    event
  );
  const env = evaluateEnv();
  console.debug(
    "Environment evaluated, continuing to actual action execution."
  );
  return await updateFDRRepoDataInternal(env, event as RepoData | undefined);
};

export const handler = handlerWrapper(updateFDRRepoData);
