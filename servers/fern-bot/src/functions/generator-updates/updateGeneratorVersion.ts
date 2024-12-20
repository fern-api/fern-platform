import { evaluateEnv } from "@libs/env";
import { handlerWrapper } from "@libs/handler-wrapper";
import { RepoData } from "@libs/schemas";
import { updateGeneratorVersionInternal } from "./actions/updateGeneratorVersion";

const updateGeneratorVersion = async (event: unknown) => {
    console.debug("Beginning scheduled run of `updateGeneratorVersion`, received event:", event);

    // Only run on Mondays
    const today = new Date();
    if (today.getDay() === 1) {
        // 1 is Monday
        console.debug("It's Monday! Running weekly task.");
        const env = evaluateEnv();
        console.debug("Environment evaluated, continuing to actual action execution.");
        return updateGeneratorVersionInternal(env, event as RepoData);
    } else {
        console.debug("It's not Monday, skipping weekly task.");
        return;
    }
};

export const handler = handlerWrapper(updateGeneratorVersion);
