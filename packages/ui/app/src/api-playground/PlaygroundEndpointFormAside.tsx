import { isApiNode } from "@fern-api/fdr-sdk";
import {
    joinUrlSlugs,
    ResolvedEndpointDefinition,
    ResolvedObjectProperty,
    visitResolvedHttpRequestBodyShape,
} from "@fern-ui/app-utils";
import { isPlainObject } from "@fern-ui/core-utils";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { atom, useAtomValue } from "jotai";
import { isUndefined } from "lodash-es";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ReactElement } from "react";
import { FernCollapse } from "../components/FernCollapse";
import { FernScrollArea } from "../components/FernScrollArea";
import { useNavigationContext } from "../navigation-context";
import { PlaygroundRequestFormState } from "./types";

const Markdown = dynamic(() => import("../api-page/markdown/Markdown").then(({ Markdown }) => Markdown), {
    ssr: true,
});

interface PlaygroundEndpointFormAsideProps {
    className?: string;
    formState: PlaygroundRequestFormState | undefined;
    endpoint: ResolvedEndpointDefinition;
    scrollAreaHeight: number;
}

export const FOCUSED_PARAMETER_ATOM = atom<string | undefined>(undefined);

export function PlaygroundEndpointFormAside({
    className,
    formState,
    endpoint,
    scrollAreaHeight,
}: PlaygroundEndpointFormAsideProps): ReactElement {
    const { activeNavigatable } = useNavigationContext();
    const focusedParameter = useAtomValue(FOCUSED_PARAMETER_ATOM);

    function renderPropertyPreview(property: ResolvedObjectProperty, id: string) {
        const isFocused = focusedParameter === id;
        return (
            <div
                className={classNames("rounded-lg px-3 py-1.5 text-sm tracking-tight cursor-pointer", {
                    "bg-tag-primary": isFocused,
                    "bg-transparent hover:bg-tag-default": !isFocused,
                })}
                onClick={() => {
                    document.getElementById(id)?.focus();
                }}
            >
                <div className="font-mono">
                    <span>{property.key}</span>
                </div>
                <FernCollapse isOpen={isFocused}>
                    <Markdown className="pt-2 text-xs">{property.description}</Markdown>
                </FernCollapse>
            </div>
        );
    }

    return (
        <aside className={classNames("sticky top-0 flex flex-col", className)} style={{ maxHeight: scrollAreaHeight }}>
            <FernScrollArea className="min-h-0 shrink" viewportClassName="py-6 pr-2 mask-grad-top">
                <div className="space-y-6">
                    {endpoint.headers.length > 0 && (
                        <div>
                            <div className="t-muted m-0 mx-3 mb-2 text-xs">Headers</div>
                            <ul className="list-none">
                                {endpoint.headers
                                    .filter((property) => !isUndefined(formState?.headers?.[property.key]))
                                    .map((param) => (
                                        <li key={param.key}>{renderPropertyPreview(param, `header.${param.key}`)}</li>
                                    ))}
                            </ul>
                        </div>
                    )}
                    {endpoint.pathParameters.length > 0 && (
                        <div>
                            <div className="t-muted m-0 mx-3 mb-2 text-xs">Path Parameters</div>
                            <ul className="list-none">
                                {endpoint.pathParameters
                                    .filter((property) => !isUndefined(formState?.pathParameters?.[property.key]))
                                    .map((param) => (
                                        <li key={param.key}>{renderPropertyPreview(param, `path.${param.key}`)}</li>
                                    ))}
                            </ul>
                        </div>
                    )}
                    {endpoint.queryParameters.length > 0 && (
                        <div>
                            <div className="t-muted m-0 mx-3 mb-2 text-xs">Query Parameters</div>
                            <ul className="list-none">
                                {endpoint.queryParameters
                                    .filter((property) => !isUndefined(formState?.queryParameters?.[property.key]))
                                    .map((param) => (
                                        <li key={param.key}>{renderPropertyPreview(param, `query.${param.key}`)}</li>
                                    ))}
                            </ul>
                        </div>
                    )}

                    {endpoint.requestBody != null &&
                        visitResolvedHttpRequestBodyShape(endpoint.requestBody.shape, {
                            fileUpload: () => null,
                            typeReference: (shape) => {
                                shape = shape.type === "reference" ? shape.shape() : shape;

                                return shape.type === "object" ? (
                                    <div>
                                        <div className="t-muted m-0 mx-3 mb-2 text-xs">Body Parameters</div>
                                        <ul className="list-none">
                                            {shape
                                                .properties()
                                                .filter(
                                                    (property) =>
                                                        formState != null &&
                                                        isPlainObject(formState.body) &&
                                                        !isUndefined(formState.body[property.key]),
                                                )
                                                .map((param) => (
                                                    <li key={param.key}>
                                                        {renderPropertyPreview(param, `body.${param.key}`)}
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
                                isApiNode(activeNavigatable) &&
                                activeNavigatable.section.api === endpoint.apiSectionId
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
