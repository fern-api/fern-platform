import { useContext } from "react";
import { WebhookContext, WebhookContextValue } from "./WebhookContext.js";

export function useWebhookContext(): WebhookContextValue {
    return useContext(WebhookContext)();
}
