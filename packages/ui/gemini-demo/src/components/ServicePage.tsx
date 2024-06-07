import { googleSans } from "@/fonts/google-sans";
import { robotoMono } from "@/fonts/roboto-mono";
import { holder } from "@/gemini";
import { pathToString } from "@/utils/pathToString";
import { visitDiscriminatedUnion } from "@/utils/visitDiscriminatedUnion";
import { FernNavigation } from "@fern-api/fdr-sdk";
import clsx from "clsx";
import { Fragment, ReactElement } from "react";
import { EndpointPage } from "./EndpointPage";

interface ApiSectionProps {
    node: FernNavigation.ApiSectionNode | FernNavigation.ApiReferenceNode;
}

export function ServicePage({ node }: ApiSectionProps): ReactElement {
    const endpoints = node.children.filter((child): child is FernNavigation.EndpointNode => child.type === "endpoint");
    return (
        <>
            {endpoints.length > 0 && (
                <div className="border-t border-[#DADCE0] px-14 first:border-none">
                    <section className="py-10">
                        <header>
                            <h1 className={clsx(googleSans.className, "mb-3 text-[2.25rem] font-normal")}>
                                {node.title}
                            </h1>
                        </header>
                        <div className="relative grid grid-cols-2 gap-10">
                            <div></div>
                            {endpoints.length > 0 && (
                                <aside className="sticky top-0">
                                    <div className="bg-[#F1F3F4]">
                                        <div className="border-b border-[#DADCE0] px-3 py-2 text-xs font-medium uppercase text-gray-600">
                                            Endpoints
                                        </div>
                                        <div className="px-3 py-2">
                                            <ul>
                                                {endpoints.map((endpointNode) => {
                                                    const endpoint = holder.endpoints.get(endpointNode.endpointId);
                                                    if (endpoint == null) {
                                                        return null;
                                                    }
                                                    return (
                                                        <li key={endpointNode.id}>
                                                            <a
                                                                className={clsx(
                                                                    robotoMono.className,
                                                                    "inline-flex cursor-pointer gap-2 text-sm",
                                                                )}
                                                            >
                                                                <span className="w-14 text-right uppercase">
                                                                    {endpointNode.method}
                                                                </span>
                                                                <span>{pathToString(endpoint.path)}</span>
                                                            </a>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                </aside>
                            )}
                        </div>
                    </section>
                </div>
            )}
            {node.children.map((child) => (
                <Fragment key={child.id}>
                    {visitDiscriminatedUnion(child)._visit({
                        apiSection: (child) => <ServicePage node={child} />,
                        endpoint: (child) => <EndpointPage node={child} />,
                        endpointPair: () => null,
                        webSocket: () => null,
                        webhook: () => null,
                        page: () => null,
                        link: () => null,
                    })}
                </Fragment>
            ))}
        </>
    );
}
