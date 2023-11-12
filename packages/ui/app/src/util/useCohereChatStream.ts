import { useLocalStorage } from "@fern-ui/react-commons";
import { useCallback } from "react";

export function useCohereChatStream(): [boolean, () => void] {
    const [enableStream, setEnableStream] = useLocalStorage("cohere-chat-stream", false);
    return [enableStream, useCallback(() => setEnableStream((prev) => !prev), [setEnableStream])];
}
