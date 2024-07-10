import { evaluateEnv } from "@libs/env";
import { handlerWrapper } from "@libs/handler-wrapper";
import { updateGeneratorVersionsInternal } from "./actions/updateGeneratorVersions";

const updateGeneratorVersions = async (_event: unknown) => {
    console.debug("Beginning scheduled run of `updateGeneratorVersions`, received event:", _event);
    const env = evaluateEnv();
    console.debug("Environment evaluated, continuing to actual action execution.");
    return updateGeneratorVersionsInternal(env);
};

export const handler = handlerWrapper(updateGeneratorVersions);
