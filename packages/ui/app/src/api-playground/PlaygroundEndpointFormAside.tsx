import { isPlainObject } from "@fern-ui/core-utils";
import { joinUrlSlugs, SidebarNode } from "@fern-ui/fdr-utils";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { atom, useAtom } from "jotai";
import { isUndefined } from "lodash-es";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ReactElement, useEffect, useRef, useState } from "react";
import { FernButton, FernButtonGroup } from "../components/FernButton";
import { FernCollapse } from "../components/FernCollapse";
import { FernScrollArea } from "../components/FernScrollArea";
import { useNavigationContext } from "../contexts/navigation-context";
import {
    dereferenceObjectProperties,
    ResolvedEndpointDefinition,
    ResolvedObjectProperty,
    ResolvedTypeDefinition,
    unwrapOptional,
    unwrapReference,
    visitResolvedHttpRequestBodyShape,
} from "../util/resolver";
import { PlaygroundEndpointRequestFormState, PlaygroundRequestFormState } from "./types";

const Markdown = dynamic(() => import("../mdx/Markdown").then(({ Markdown }) => Markdown), {
    ssr: true,
});

interface PlaygroundEndpointFormAsideProps {
    className?: string;
    formState: PlaygroundEndpointRequestFormState | undefined;
    endpoint: ResolvedEndpointDefinition;
    scrollAreaHeight: number;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    types: Record<string, ResolvedTypeDefinition>;
}

export const FOCUSED_PARAMETER_ATOM = atom<string | undefined>(undefined);

function resolveBreadcrumbs(formState: PlaygroundRequestFormState | undefined, breadcrumbs: string[] = []): unknown {
    if (formState == null) {
        return undefined;
    }

    let value: unknown = formState;
    for (const crumb of breadcrumbs) {
        if (!isPlainObject(value)) {
            return undefined;
        }
        value = value[crumb];
        if (value == null) {
            return undefined;
        }
    }
    return value;
}

export function PlaygroundEndpointFormAside({
    className,
    formState,
    endpoint,
    scrollAreaHeight,
    resetWithExample,
    resetWithoutExample,
    types,
}: PlaygroundEndpointFormAsideProps): ReactElement {
    const { activeNavigatable } = useNavigationContext();
    const [focusedParameter, setFocusedParameter] = useAtom(FOCUSED_PARAMETER_ATOM);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [scrollAreaWidth, setScrollAreaWidth] = useState(() => scrollAreaRef.current?.clientWidth ?? 0);
    useEffect(() => {
        if (scrollAreaRef.current == null) {
            return;
        }
        const observer = new ResizeObserver(([entry]) => {
            if (entry != null) {
                setScrollAreaWidth(entry.contentRect.width);
            }
        });
        observer.observe(scrollAreaRef.current);
        return () => observer.disconnect();
    });

    useEffect(() => {
        if (focusedParameter != null) {
            const element = document.getElementById(`link-to/${focusedParameter}`);
            if (element != null) {
                element.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
            }
        }
    }, [focusedParameter]);

    function renderPropertyPreview(property: ResolvedObjectProperty, id: string, breadcrumbs: string[] = []) {
        const isFocused = focusedParameter === id;
        const shape = unwrapOptional(property.valueShape, types);
        return (
            <>
                <div
                    className={cn("rounded-lg px-3 py-1.5 text-sm tracking-tight cursor-default", {
                        "bg-tag-primary": isFocused,
                        "bg-transparent hover:bg-tag-default": !isFocused,
                    })}
                    onClick={() => {
                        document.getElementById(id)?.focus();
                        setFocusedParameter(id);
                    }}
                >
                    <div className="truncate">
                        <span className="font-mono">{property.key}</span>
                    </div>
                    <FernCollapse isOpen={isFocused}>
                        <Markdown className="py-2 text-xs" mdx={property.description} />
                    </FernCollapse>
                </div>
                {shape.type === "object" && (
                    <ul className="list-none" style={{ paddingLeft: `${10 * (breadcrumbs.length - 1)}px` }}>
                        {dereferenceObjectProperties(shape, types)
                            .filter((property) => resolveBreadcrumbs(formState, [...breadcrumbs, property.key]))
                            .map((param) => (
                                <li key={param.key}>
                                    {renderPropertyPreview(param, `${id}.${param.key}`, [...breadcrumbs, property.key])}
                                </li>
                            ))}
                    </ul>
                )}
            </>
        );
    }

    const headers = endpoint.headers.filter((property) => !isUndefined(formState?.headers?.[property.key]));
    const pathParameters = endpoint.pathParameters.filter(
        (property) => !isUndefined(formState?.pathParameters?.[property.key]),
    );
    const queryParameters = endpoint.queryParameters.filter(
        (property) => !isUndefined(formState?.queryParameters?.[property.key]),
    );

    return (
        <aside className={cn("sticky top-0 flex flex-col", className)} style={{ maxHeight: scrollAreaHeight }}>
            <FernScrollArea
                rootRef={scrollAreaRef}
                rootClassName="min-h-0 shrink"
                className="mask-grad-top py-6 pr-2"
                type="scroll"
                scrollbars="vertical"
            >
                <FernButtonGroup className="mb-6 p-1">
                    <FernButton onClick={resetWithExample} size="small" variant="minimal">
                        Use example
                    </FernButton>
                    <FernButton onClick={resetWithoutExample} size="small" variant="minimal">
                        Clear form
                    </FernButton>
                </FernButtonGroup>

                <div className="space-y-6" style={{ width: `${scrollAreaWidth - 8}px` }}>
                    {headers.length > 0 && (
                        <div>
                            <div className="t-muted m-0 mx-3 mb-2 text-xs">Headers</div>
                            <ul className="list-none">
                                {headers.map((param) => (
                                    <li key={param.key} id={`link-to/header.${param.key}`}>
                                        {renderPropertyPreview(param, `header.${param.key}`, ["headers"])}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {pathParameters.length > 0 && (
                        <div>
                            <div className="t-muted m-0 mx-3 mb-2 text-xs">Path Parameters</div>
                            <ul className="list-none">
                                {pathParameters.map((param) => (
                                    <li key={param.key} id={`link-to/path.${param.key}`}>
                                        {renderPropertyPreview(param, `path.${param.key}`, ["pathParameters"])}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {queryParameters.length > 0 && (
                        <div>
                            <div className="t-muted m-0 mx-3 mb-2 text-xs">Query Parameters</div>
                            <ul className="list-none">
                                {queryParameters.map((param) => (
                                    <li key={param.key} id={`link-to/query.${param.key}`}>
                                        {renderPropertyPreview(param, `query.${param.key}`, ["queryParameters"])}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {endpoint.requestBody[0] != null &&
                        visitResolvedHttpRequestBodyShape(endpoint.requestBody[0].shape, {
                            fileUpload: () => null,
                            bytes: () => null,
                            typeShape: (shape) => {
                                shape = unwrapReference(shape, types);

                                return shape.type === "object" ? (
                                    <div>
                                        <div className="t-muted m-0 mx-3 mb-2 text-xs">Body Parameters</div>
                                        <ul className="list-none">
                                            {dereferenceObjectProperties(shape, types)
                                                .filter(
                                                    (property) =>
                                                        formState?.body?.value != null &&
                                                        isPlainObject(formState.body.value) &&
                                                        !isUndefined(formState.body.value[property.key]),
                                                )
                                                .map((param) => (
                                                    <li key={param.key} id={`link-to/body.${param.key}`}>
                                                        {renderPropertyPreview(param, `body.${param.key}`, [
                                                            "body",
                                                            param.key,
                                                        ])}
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                ) : null;
                            },
                        })}

                    <div className="mx-3">
                        <Link
                            href={`/${joinUrlSlugs(...endpoint.slug)}`}
                            shallow={
                                activeNavigatable != null &&
                                SidebarNode.isApiPage(activeNavigatable) &&
                                activeNavigatable.api === endpoint.apiSectionId
                            }
                            className="t-muted hover:t-accent inline-flex items-center gap-1 text-sm font-semibold underline decoration-1 underline-offset-4 hover:decoration-2"
                        >
                            <span>View in API Reference</span>
                            <ArrowTopRightIcon className="size-4" />
                        </Link>
                    </div>
                </div>
            </FernScrollArea>
        </aside>
    );
}
