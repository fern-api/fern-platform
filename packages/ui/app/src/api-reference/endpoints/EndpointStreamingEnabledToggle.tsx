import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useAtom, useSetAtom } from "jotai";
import { MutableRefObject, ReactElement } from "react";
import { FERN_STREAM_ATOM, SLUG_ATOM } from "../../atoms";
import { StreamingEnabledToggle } from "./StreamingEnabledToggle";

interface EndpointStreamingEnabledToggleProps {
    endpointPair: FernNavigation.EndpointPairNode;
    container: MutableRefObject<HTMLElement | null>;
}

export function EndpointStreamingEnabledToggle({
    endpointPair,
    container,
}: EndpointStreamingEnabledToggleProps): ReactElement {
    const [isStream, setIsStream] = useAtom(FERN_STREAM_ATOM);
    const setSlug = useSetAtom(SLUG_ATOM);
    return (
        <StreamingEnabledToggle
            className="ml-2 w-[200px]"
            value={isStream}
            setValue={(value) => {
                setIsStream(value);
                const endpoint = endpointPair[value ? "stream" : "nonStream"];
                setSlug(endpoint.slug);
                setTimeout(() => {
                    if (container.current != null) {
                        container.current.scrollIntoView({ behavior: "instant" });
                    }
                }, 0);
            }}
        />
    );
}
