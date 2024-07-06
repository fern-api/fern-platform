import { useRouter } from "next/router";
import { MutableRefObject, ReactElement } from "react";
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
    const router = useRouter();
    return (
        <StreamingEnabledToggle
            className="ml-2 w-[200px]"
            value={value}
            setValue={(value) => {
                setValue(value);
                const endpoint = value && endpointProp.stream != null ? endpointProp.stream : endpointProp;
                void router.replace(`/${endpoint.slug}`, undefined, {
                    shallow: true,
                });
                setTimeout(() => {
                    if (container.current != null) {
                        container.current.scrollIntoView({ behavior: "instant" });
                    }
                }, 0);
            }}
        />
    );
}
