import { EndpointPathPart } from "@fern-ui/app-utils";
import { isNonNullish, visitDiscriminatedUnion } from "@fern-ui/core-utils";

export const renderPathParts = (parts: EndpointPathPart[]): JSX.Element[] => {
    const elements: (JSX.Element | null)[] = [];
    // Temporarily hiding base url
    // if (apiDefinition.hasMultipleBaseUrls === true) {
    //     const url = getEndpointEnvironmentUrl(endpoint);
    //     if (url != null) {
    //         elements.push(
    //             <div key="base-url" className="t-muted whitespace-nowrap font-light">
    //                 {url}
    //             </div>
    //         );
    //     }
    // }
    parts.forEach((p, i) => {
        elements.push(
            <div key={`separator-${i}`} className="text-text-disabled-light dark:text-text-disabled-dark">
                /
            </div>,
            visitDiscriminatedUnion(p, "type")._visit({
                literal: (literal) => {
                    return (
                        <div key={`part-${i}`} className="t-muted whitespace-nowrap font-mono text-xs font-normal">
                            {literal.value}
                        </div>
                    );
                },
                pathParameter: (pathParameter) => (
                    <div
                        key={`part-${i}`}
                        className="bg-accent-highlight text-accent-primary flex items-center justify-center whitespace-nowrap rounded px-1 font-mono text-xs font-normal"
                    >
                        :{pathParameter.name}
                    </div>
                ),
                _other: () => null,
            })
        );
    });
    return elements.filter(isNonNullish);
};
