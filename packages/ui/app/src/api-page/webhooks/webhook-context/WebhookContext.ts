import { createContext } from "react";
import { JsonPropertyPath } from "../../examples/json-example/contexts/JsonPropertyPath";

export const WebhookContext = createContext<() => WebhookContextValue>(() => {
    throw new Error("WebhookContextProvider not found in tree");
});

export interface WebhookContextValue {
    hoveredPayloadPropertyPath: JsonPropertyPath | undefined;
    setHoveredPayloadPropertyPath: (path: JsonPropertyPath | undefined) => void;
}
