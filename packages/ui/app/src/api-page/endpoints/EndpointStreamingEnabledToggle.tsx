import { useSetAtom } from "jotai";
import { MutableRefObject, ReactElement } from "react";
import { SLUG_ATOM } from "../../atoms";
import { ResolvedEndpointDefinition } from "../../resolver/types";
import { StreamingEnabledToggle } from "./StreamingEnabledToggle";

export function EndpointStreamingEnabledToggle({
    value,
    setValue,
    endpointProp,
    container,
}: {
    value: boolean;
    setValue: (enabled: boolean) => void;
    endpointProp: ResolvedEndpointDefinition;
    container: MutableRefObject<HTMLElement | null>;
}): ReactElement {
    const setSlug = useSetAtom(SLUG_ATOM);
    return (
        <StreamingEnabledToggle
            className="ml-2 w-[200px]"
            value={value}
            setValue={(value) => {
                setValue(value);
                const endpoint = value && endpointProp.stream != null ? endpointProp.stream : endpointProp;
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
