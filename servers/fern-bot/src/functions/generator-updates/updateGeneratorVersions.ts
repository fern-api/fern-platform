import { evaluateEnv } from "@libs/env";
import { handlerWrapper } from "@libs/handler-wrapper";
import { updateGeneratorVersionsInternal } from "./actions/updateGeneratorVersions";

export const updateGeneratorVersions = async (_event: unknown): Promise<void> => {
    console.debug("Beginning scheduled run of `updateGeneratorVersions`, received event:", _event);
    const env = evaluateEnv();
    console.debug("Environment evaluated, continuing to actual action execution.");
    await updateGeneratorVersionsInternal(env);
};

export const handler = handlerWrapper(updateGeneratorVersions);
