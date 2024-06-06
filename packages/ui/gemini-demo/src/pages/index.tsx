/* eslint-disable @next/next/no-img-element */
import { fdr } from "@/gemini";
import { ApiReferenceNavigationConverter } from "@fern-api/fdr-sdk/dist/navigation";
import clsx from "clsx";
import { Roboto, Roboto_Mono } from "next/font/google";
import { ReactElement } from "react";

const roboto = Roboto({
    weight: ["400", "500", "700"],
});
const robotoMono = Roboto_Mono({
    weight: ["400", "500", "700"],
});

// function pathToString(path: FernIr.HttpPath): string {
//     return urljoin(path.head, ...path.parts.flatMap((part) => [`:${part.pathParameter}`, part.tail]));
// }

const endpoint = ApiReferenceNavigationConverter.convert(
    {
        title: "API Reference",
        api: "api-reference",
        skipUrlSlug: true,
        showErrors: false,
        urlSlug: "api-reference",
    },
    fdr,
    "",
    "",
);

export default function Home(): ReactElement {
    return (
        <main className={clsx(roboto.className, "flex min-h-screen")}>
            <aside className="w-[280px] h-screen sticky top-0 shadow-google">
                <div className="p-4 pb-2">
                    <img src="/google-ai-for-developers.svg" alt="Logo" />
                </div>
            </aside>
            <article className="flex-1">
                {/* {flattenedIr.map((subpackageId) => {
                    const subpackage =
                        subpackageId === ":root:"
                            ? { name: ir.apiName, ...ir.rootPackage }
                            : ir.subpackages[subpackageId];
                    const service = subpackage.service != null ? ir.services[subpackage.service] : undefined;
                    if (subpackage.docs == null && service == null) {
                        return null;
                    }
                    return (
                        <div key={subpackageId} className="border-t border-[#DADCE0] first:border-none px-14">
                            <section className="py-10">
                                <header>
                                    <h1 className={clsx(googleSans.className, "text-[2.25rem] font-normal mb-3")}>
                                        {subpackage.name.originalName}
                                    </h1>
                                </header>
                                <div className="grid grid-cols-2 gap-10 relative">
                                    <div>{subpackage.docs}</div>
                                    {service != null && service.endpoints.length > 0 && (
                                        <aside className="sticky top-0">
                                            <div className="bg-[#F1F3F4]">
                                                <div className="px-3 py-2 border-b border-[#DADCE0] uppercase text-xs font-medium text-gray-600">
                                                    Endpoints
                                                </div>
                                                <div className="px-3 py-2">
                                                    <ul>
                                                        {service?.endpoints.map((endpoint) => (
                                                            <li key={endpoint.id}>
                                                                <a
                                                                    className={clsx(
                                                                        robotoMono.className,
                                                                        "inline-flex gap-2 text-sm cursor-pointer",
                                                                    )}
                                                                >
                                                                    <span className="text-right uppercase w-14">
                                                                        {endpoint.method}
                                                                    </span>
                                                                    <span>{pathToString(endpoint.fullPath)}</span>
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </aside>
                                    )}
                                </div>
                            </section>
                            {service?.endpoints.map((endpoint) => {
                                const example = endpoint.examples.filter(
                                    (example) => example.response.type === "ok",
                                )[0];
                                return (
                                    <section
                                        className="py-10 border-t border-[#DADCE0] overflow-hidden"
                                        key={endpoint.id}
                                    >
                                        <header>
                                            <h1
                                                className={clsx(
                                                    googleSans.className,
                                                    "text-[2.25rem] font-normal mb-3",
                                                )}
                                            >
                                                {endpoint.displayName ?? endpoint.name.originalName}
                                            </h1>
                                        </header>
                                        <div className="grid grid-cols-2 gap-10 relative">
                                            <div>
                                                <div>{endpoint.docs}</div>

                                                <h3 className="text-2xl mt-12 mb-3">Path parameters</h3>
                                                <PathParameters parameters={endpoint.pathParameters} />

                                                <h3 className="text-2xl mt-12 mb-3">Query parameters</h3>
                                                <QueryParameters parameters={endpoint.queryParameters} />

                                                {endpoint.requestBody != null && (
                                                    <>
                                                        <h3 className="text-2xl mt-12 mb-3">Request</h3>
                                                        <RequestBody body={endpoint.requestBody} />
                                                    </>
                                                )}

                                                <h3 className="text-2xl mt-12 mb-3">Response</h3>
                                                <ul>
                                                    {endpoint.queryParameters.map((queryParameter) => (
                                                        <li
                                                            key={queryParameter.name.wireValue}
                                                            className="flex flex-col gap-2 border-t border-[#DADCE0] py-4"
                                                        >
                                                            <h4>
                                                                <span className="font-mono font-semibold">
                                                                    {queryParameter.name.name.originalName}
                                                                </span>
                                                            </h4>

                                                            <div>{queryParameter.docs}</div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <aside className="sticky top-0">
                                                <div className="gap-6 grid grid-rows-[repeat(auto-fit,minmax(0,min-content))] grid-rows">
                                                    <div className="bg-[#F1F3F4]">
                                                        <div className="px-3 py-2 border-b border-[#DADCE0] text-xs">
                                                            <span className="font-mono inline-flex gap-2">
                                                                <span>{endpoint.method}</span>
                                                                <span>{pathToString(endpoint.fullPath)}</span>
                                                            </span>
                                                        </div>
                                                        <div className="px-3 py-2">
                                                            <pre className="text-sm">
                                                                <code>
                                                                    {JSON.stringify(
                                                                        example.request?.jsonExample,
                                                                        null,
                                                                        2,
                                                                    )}
                                                                </code>
                                                            </pre>
                                                        </div>
                                                    </div>
                                                    <div className="bg-[#F1F3F4]">
                                                        <div className="px-3 py-2 border-b border-[#DADCE0] uppercase text-xs font-medium text-gray-600">
                                                            Response
                                                        </div>
                                                        <div className="px-3 py-2">
                                                            <pre className="text-sm">
                                                                <code>{JSON.stringify(example.response, null, 2)}</code>
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            </aside>
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    );
                })} */}
            </article>
        </main>
    );
}
