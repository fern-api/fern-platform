import { evaluateEnv } from "@libs/env";
import { handlerWrapper } from "@libs/handler-wrapper";
import { updateFDRRepoDataInternal } from "./actions/updateFDRRepoData";

const updateFDRRepoData = async (event: unknown) => {
    console.debug("Beginning scheduled run of `updateRepoData`, received event:", event);
    const env = evaluateEnv();
    console.debug("Environment evaluated, continuing to actual action execution.");
    return updateFDRRepoDataInternal(env, event as RepoData);
};

export const handler = handlerWrapper(updateFDRRepoData);
