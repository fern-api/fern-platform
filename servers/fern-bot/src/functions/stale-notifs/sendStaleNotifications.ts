import { evaluateEnv } from "@libs/env";
import { handlerWrapper } from "@libs/handler-wrapper";
import { sendStaleNotificationsInternal } from "./actions/sendStaleNotifications";

const sendStaleNotifications = async (event: unknown) => {
  console.debug(
    "Beginning scheduled run of `sendStaleNotifications`, received event:",
    event
  );
  const env = evaluateEnv();
  console.debug(
    "Environment evaluated, continuing to actual action execution."
  );
  return await sendStaleNotificationsInternal(env);
};

export const handler = handlerWrapper(sendStaleNotifications);
