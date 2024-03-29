import { FC, useEffect, useMemo, useRef } from "react";
import { FernSyntaxHighlighter } from "../syntax-highlighting/FernSyntaxHighlighter";
import { ScrollToHandle } from "../syntax-highlighting/FernSyntaxHighlighterTokens";
import { PlaygroundResponse } from "./types/playgroundResponse";

interface PlaygroundResponsePreviewProps {
    response: PlaygroundResponse;
}

export const PlaygroundResponsePreview: FC<PlaygroundResponsePreviewProps> = ({ response }) => {
    const responseJson = useMemo(
        () =>
            response.type === "stream"
                ? response.response.body
                : response.type === "file"
                  ? ""
                  : JSON.stringify(response.response.body, null, 2),
        [response],
    );
    const viewportRef = useRef<ScrollToHandle>(null);

    // const [shouldScroll, setShouldScroll] = useState(true);

    // Scroll to bottom if shouldScroll is true
    useEffect(() => {
        const { current } = viewportRef;
        if (current && response.type === "stream") {
            current.scrollToLast();
        }
    }, [response.type, responseJson]);

    return (
        <FernSyntaxHighlighter
            className="relative min-h-0 flex-1 shrink"
            language="json"
            code={responseJson}
            fontSize="sm"
            viewportRef={viewportRef}
        />
    );
};
