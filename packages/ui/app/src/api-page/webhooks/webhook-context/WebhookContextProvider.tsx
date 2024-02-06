import { useCallback, useState } from "react";
import { JsonPropertyPath } from "../../examples/json-example/contexts/JsonPropertyPath";
import { WebhookContext, WebhookContextValue } from "./WebhookContext";

export const WebhookContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [hoveredPayloadPropertyPath, setHoveredPayloadPropertyPath] = useState<JsonPropertyPath | undefined>();

    const contextValue = useCallback(
        (): WebhookContextValue => ({
            hoveredPayloadPropertyPath,
            setHoveredPayloadPropertyPath,
        }),
        [hoveredPayloadPropertyPath, setHoveredPayloadPropertyPath],
    );

    return <WebhookContext.Provider value={contextValue}>{children}</WebhookContext.Provider>;
};
