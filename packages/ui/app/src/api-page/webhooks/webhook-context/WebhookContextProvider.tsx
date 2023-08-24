import { useCallback, useState } from "react";
import { JsonPropertyPath } from "../../examples/json-example/contexts/JsonPropertyPath";
import { WebhookContext, WebhookContextValue } from "./WebhookContext";

export const WebhookContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [hoveredRequestPropertyPath, setHoveredRequestPropertyPath] = useState<JsonPropertyPath | undefined>();
    const [hoveredResponsePropertyPath, setHoveredResponsePropertyPath] = useState<JsonPropertyPath | undefined>();

    const contextValue = useCallback(
        (): WebhookContextValue => ({
            hoveredRequestPropertyPath,
            setHoveredRequestPropertyPath,
            hoveredResponsePropertyPath,
            setHoveredResponsePropertyPath,
        }),
        [hoveredRequestPropertyPath, hoveredResponsePropertyPath]
    );

    return <WebhookContext.Provider value={contextValue}>{children}</WebhookContext.Provider>;
};
