import { evaluateEnv } from "@libs/env";
import { handlerWrapper } from "@libs/handler-wrapper";

const updateGeneratorVersion = async (_event: unknown) => {
    console.debug("Beginning scheduled run of `updateGeneratorVersion`, received event:", _event);
    const env = evaluateEnv();
    console.debug("Environment evaluated, continuing to actual action execution.");
    // return updateGeneratorVersionInternal(env);
};

export const handler = handlerWrapper(updateGeneratorVersion);
