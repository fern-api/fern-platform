import { isApiNode } from "@fern-api/fdr-sdk";
import { joinUrlSlugs, ResolvedEndpointDefinition, visitResolvedHttpRequestBodyShape } from "@fern-ui/app-utils";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { atom, useAtomValue } from "jotai";
import Link from "next/link";
import { ReactElement } from "react";
import { FernButton } from "../components/FernButton";
import { FernScrollArea } from "../components/FernScrollArea";
import { useNavigationContext } from "../navigation-context";
import { hasOptionalFields, hasRequiredFields } from "./utils";

interface PlaygroundEndpointFormAsideProps {
    className?: string;
    endpoint: ResolvedEndpointDefinition;
    scrollAreaHeight: number;
}

interface FocusedParameterState {
    type: "header" | "path" | "query" | "body";
    key: string;
}

export const FOCUSED_PARAMETER_ATOM = atom<FocusedParameterState | undefined>(undefined);

export function PlaygroundEndpointFormAside({
    className,
    endpoint,
    scrollAreaHeight,
}: PlaygroundEndpointFormAsideProps): ReactElement {
    const { activeNavigatable } = useNavigationContext();
    const focusedParameter = useAtomValue(FOCUSED_PARAMETER_ATOM);
    return (
        <aside className={classNames("sticky top-0 flex flex-col", className)} style={{ maxHeight: scrollAreaHeight }}>
            <FernScrollArea className="min-h-0 shrink" viewportClassName="py-6 pr-2 mask-grad-top">
                <div className="space-y-6">
                    {endpoint.headers.length > 0 && (
                        <div>
                            <div className="t-muted m-0 mx-3 mb-2 text-xs">Headers</div>
                            <ul className="list-none">
                                {endpoint.headers.map((param) => (
                                    <li key={param.key}>
                                        <FernButton
                                            variant="minimal"
                                            mono={true}
                                            className="w-full text-left"
                                            active={
                                                focusedParameter?.type === "header" &&
                                                focusedParameter.key === param.key
                                            }
                                        >
                                            {param.key}
                                        </FernButton>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {endpoint.pathParameters.length > 0 && (
                        <div>
                            <div className="t-muted m-0 mx-3 mb-2 text-xs">Path Parameters</div>
                            <ul className="list-none">
                                {endpoint.pathParameters.map((param) => (
                                    <li key={param.key}>
                                        <FernButton
                                            variant="minimal"
                                            mono={true}
                                            className="w-full text-left"
                                            active={
                                                focusedParameter?.type === "path" && focusedParameter.key === param.key
                                            }
                                        >
                                            {param.key}
                                        </FernButton>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {endpoint.queryParameters.length > 0 && (
                        <div>
                            <div className="t-muted m-0 mx-3 mb-2 text-xs">Query Parameters</div>
                            <ul className="list-none">
                                {endpoint.queryParameters.map((param) => (
                                    <li key={param.key}>
                                        <FernButton
                                            variant="minimal"
                                            mono={true}
                                            className="w-full text-left"
                                            active={
                                                focusedParameter?.type === "query" && focusedParameter.key === param.key
                                            }
                                        >
                                            {param.key}
                                        </FernButton>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {endpoint.requestBody != null && hasRequiredFields(endpoint.requestBody.shape) && (
                        <div>
                            <div className="t-muted m-0 mx-3 mb-2 text-xs">Body Parameters</div>

                            <ul className="list-none">
                                {visitResolvedHttpRequestBodyShape(endpoint.requestBody.shape, {
                                    fileUpload: () => null,
                                    typeReference: (shape) =>
                                        shape.type === "object"
                                            ? shape.properties().map((param) =>
                                                  param.valueShape.type !== "optional" ? (
                                                      <li key={param.key}>
                                                          <FernButton
                                                              variant="minimal"
                                                              mono={true}
                                                              className="w-full text-left"
                                                              active={
                                                                  focusedParameter?.type === "body" &&
                                                                  focusedParameter.key === param.key
                                                              }
                                                          >
                                                              {param.key}
                                                          </FernButton>
                                                      </li>
                                                  ) : null,
                                              )
                                            : null,
                                })}
                            </ul>
                        </div>
                    )}

                    {endpoint.requestBody != null && hasOptionalFields(endpoint.requestBody.shape) && (
                        <div>
                            <div className="t-muted m-0 mx-3 mb-2 text-xs">Additional Body Parameters</div>

                            <ul className="list-none">
                                {visitResolvedHttpRequestBodyShape(endpoint.requestBody.shape, {
                                    fileUpload: () => null,
                                    typeReference: (shape) =>
                                        shape.type === "object"
                                            ? shape.properties().map((param) =>
                                                  param.valueShape.type === "optional" ? (
                                                      <li key={param.key}>
                                                          <FernButton
                                                              variant="minimal"
                                                              mono={true}
                                                              className="w-full text-left"
                                                              active={
                                                                  focusedParameter?.type === "body" &&
                                                                  focusedParameter.key === param.key
                                                              }
                                                          >
                                                              {param.key}
                                                          </FernButton>
                                                      </li>
                                                  ) : undefined,
                                              )
                                            : null,
                                })}
                            </ul>
                        </div>
                    )}

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
