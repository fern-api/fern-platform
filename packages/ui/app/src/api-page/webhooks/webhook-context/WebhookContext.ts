import { createContext } from "react";
import { JsonPropertyPath } from "../../examples/json-example/contexts/JsonPropertyPath";

export const WebhookContext = createContext<() => WebhookContextValue>(() => {
    throw new Error("WebhookContextProvider not found in tree");
});

export interface WebhookContextValue {
    hoveredRequestPropertyPath: JsonPropertyPath | undefined;
    setHoveredRequestPropertyPath: (path: JsonPropertyPath | undefined) => void;

    hoveredResponsePropertyPath: JsonPropertyPath | undefined;
    setHoveredResponsePropertyPath: (path: JsonPropertyPath | undefined) => void;
}
