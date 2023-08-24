import { useContext } from "react";
import { WebhookContext, WebhookContextValue } from "./WebhookContext";

export function useWebhookContext(): WebhookContextValue {
    return useContext(WebhookContext)();
}
