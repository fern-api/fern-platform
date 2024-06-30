import { evaluateEnv } from "@libs/env";
import { handlerWrapper } from "@libs/handler-wrapper";
import { RepoData } from "@libs/schemas";
import { updateGeneratorVersionInternal } from "./actions/updateGeneratorVersion";

const updateGeneratorVersion = async (event: unknown) => {
    console.debug("Beginning scheduled run of `updateGeneratorVersion`, received event:", event);
    const env = evaluateEnv();
    console.debug("Environment evaluated, continuing to actual action execution.");
    const eo = event as object;
    if ("shouldUpdateGenerators" in eo && eo.shouldUpdateGenerators === true) {
        return updateGeneratorVersionInternal(env, event as RepoData);
    }
};

export const handler = handlerWrapper(updateGeneratorVersion);
