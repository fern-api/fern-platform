import { googleSans } from "@/fonts/google-sans";
import { holder } from "@/gemini";
import { pathToString } from "@/utils/pathToString";
import { FernNavigation } from "@fern-api/fdr-sdk";
import clsx from "clsx";
import { ReactElement } from "react";
import { PathParameters } from "./PathParameters";
import { QueryParameters } from "./QueryParameters";
import { RequestBody } from "./RequestBody";
import { ResponseBody } from "./ResponseBody";

export interface EndpointPageProps {
    node: FernNavigation.EndpointNode;
}

export function EndpointPage({ node}: EndpointPageProps): ReactElement | null {
    const endpoint = holder.endpoints.get(node.endpointId);
    if (endpoint == null) {
        return null;
    }
    const example = endpoint.examples[0];
    return (
        <div className="border-t border-[#DADCE0] px-14 first:border-none">
            <section className="py-10" key={endpoint.id}>
                <header>
                    <h1 className={clsx(googleSans.className, "mb-3 text-[2.25rem] font-normal")}>{endpoint.name}</h1>
                </header>
                <div className="grid grid-cols-2 gap-10">
                    <div>
                        <div>{endpoint.description}</div>

                        <PathParameters parameters={endpoint.path.pathParameters} />
                        <QueryParameters parameters={endpoint.queryParameters} />
                        <RequestBody body={endpoint.request} />
                        <ResponseBody body={endpoint.response} />
                    </div>
                    <aside className="sticky top-10 max-h-[calc(100vh-5rem)]">
                        <div className="grid-rows grid max-h-fit w-full grid-rows-[repeat(auto-fit,minmax(0,min-content))] gap-4">
                            <div className="overflow-hidden bg-[#F1F3F4] relative max-h-20">
                                <div className="border-b border-[#DADCE0] px-3 py-2 text-xs">
                                    <span className="inline-flex gap-2 font-mono">
                                        <span>{endpoint.method}</span>
                                        <span>{pathToString(endpoint.path)}</span>
                                    </span>
                                </div>
                                <div className="overflow-scroll px-3 py-2">
                                    <pre className="text-sm">
                                        <code>{JSON.stringify(example.requestBodyV3?.value, null, 2)}</code>
                                    </pre>
                                </div>
                            </div>
                            <div className="overflow-hidden bg-[#F1F3F4] relative max-h-10">
                                <div className="border-b border-[#DADCE0] px-3 py-2 text-xs font-medium uppercase text-gray-600">
                                    Response
                                </div>
                                <div className="overflow-scroll px-3 py-2">
                                    <pre className="text-sm">
                                        <code>{JSON.stringify(example.responseBodyV3?.value, null, 2)}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>
        </div>
    );
}