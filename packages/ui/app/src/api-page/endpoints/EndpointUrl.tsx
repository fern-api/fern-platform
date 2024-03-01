import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import React, {
    PropsWithChildren,
    ReactElement,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import { buildRequestUrl } from "../../api-playground/utils";
import { CopyToClipboardButton } from "../../commons/CopyToClipboardButton";
import { HttpMethodTag } from "../../commons/HttpMethodTag";
import { divideEndpointPathToParts, type EndpointPathPart } from "../../util/endpoint";
import { ResolvedEndpointPathParts } from "../../util/resolver";
import "./EndpointUrl.scss";

export declare namespace EndpointUrl {
    export type Props = React.PropsWithChildren<{
        path: ResolvedEndpointPathParts[];
        method: APIV1Read.HttpMethod;
        environment?: string;
        showEnvironment?: boolean;
        large?: boolean;
        className?: string;
    }>;
}

export const EndpointUrl = React.forwardRef<HTMLDivElement, PropsWithChildren<EndpointUrl.Props>>(function EndpointUrl(
    { path, method, environment, showEnvironment, large, className },
    parentRef,
) {
    const endpointPathParts = useMemo(() => divideEndpointPathToParts(path), [path]);

    const ref = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    useImperativeHandle(parentRef, () => ref.current!);

    const renderPathParts = (parts: EndpointPathPart[]) => {
        const elements: (ReactElement | null)[] = [];
        if (showEnvironment && environment != null) {
            elements.push(
                <span key="base-url" className="text-faded whitespace-nowrap max-sm:hidden">
                    {environment}
                </span>,
            );
        }
        parts.forEach((p, i) => {
            elements.push(
                <span key={`separator-${i}`} className="text-faded">
                    /
                </span>,
                visitDiscriminatedUnion(p, "type")._visit({
                    literal: (literal) => {
                        return (
                            <span key={`part-${i}`} className="t-muted whitespace-nowrap">
                                {literal.value}
                            </span>
                        );
                    },
                    pathParameter: (pathParameter) => (
                        <span key={`part-${i}`} className="bg-accent-highlight t-accent whitespace-nowrap rounded px-1">
                            :{pathParameter.name}
                        </span>
                    ),
                    _other: () => null,
                }),
            );
        });
        return elements;
    };

    // check if overflow is visible
    const isOverflowVisible = ref.current != null ? ref.current.scrollWidth > ref.current.clientWidth : false;

    const [showLeftMask, setShowLeftMask] = useState(false);
    const [hideRightMask, setHideRightMask] = useState(() =>
        ref.current != null ? ref.current.scrollLeft === ref.current.scrollWidth - ref.current.clientWidth : false,
    );

    const [nonce, setNonce] = useState(0);

    // force measurement on mount
    useEffect(() => setNonce((n) => n + 1), []);

    // check if overflow is visible
    useEffect(() => {
        const refCurrent = ref.current;

        if (refCurrent == null) {
            return;
        }
        const measure = () => {
            // check if scrolled to right > 0px
            setShowLeftMask(refCurrent.scrollLeft > 0);

            // check if scrolled all the way to the right
            setHideRightMask(refCurrent.scrollLeft === refCurrent.scrollWidth - refCurrent.clientWidth);
        };

        refCurrent.addEventListener("scroll", measure);

        measure();
        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(refCurrent);

        return () => {
            refCurrent.removeEventListener("scroll", measure);
            resizeObserver.disconnect();
        };
    }, [nonce]);

    return (
        <div
            ref={ref}
            className={classNames(
                "flex h-8 items-center gap-1 overflow-x-auto pr-2",
                {
                    ["url-overflow"]: isOverflowVisible,
                    ["left-mask"]: showLeftMask,
                    ["right-mask"]: !hideRightMask,
                },
                className,
            )}
        >
            <HttpMethodTag method={method} />
            <div className={classNames("flex items-center")}>
                <CopyToClipboardButton content={buildRequestUrl(environment, path)}>
                    {(onClick) => (
                        <span
                            className={classNames(
                                "inline-flex shrink items-baseline hover:bg-tag-default py-0.5 px-1 rounded-md cursor-default",
                            )}
                            onClick={onClick}
                        >
                            <span
                                className={classNames("font-mono", {
                                    "text-xs": !large,
                                    "text-sm": large,
                                })}
                            >
                                {renderPathParts(endpointPathParts)}
                            </span>
                        </span>
                    )}
                </CopyToClipboardButton>
            </div>
        </div>
    );
});
