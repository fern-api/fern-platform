import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { MouseEventHandler, MutableRefObject, useEffect, useState } from "react";
import { CurlExample } from "../api-page/examples/curl-example/CurlExample";
import { CurlLine } from "../api-page/examples/curl-example/curlUtils";
import { JsonPropertyPath } from "../api-page/examples/json-example/contexts/JsonPropertyPath";
import { CopyToClipboardButton } from "../commons/CopyToClipboardButton";

interface Props {
    className?: string;
    ref?: MutableRefObject<HTMLDivElement | null>;
    type: "primary" | "warning";
    data: CurlLine[];
    onClick?: MouseEventHandler<HTMLDivElement>;

    endpoint: FernRegistryApiRead.EndpointDefinition;
    selectedProp: JsonPropertyPath | undefined;
    copyToClipboard?: () => string; // use provider to lazily compute clipboard text
}

export default function ApiRequest({
    className,
    ref,
    type = "primary",
    data,
    onClick,
    endpoint,
    selectedProp,
    copyToClipboard,
}: Props): JSX.Element {
    const [contentRef, setContentRef] = useState<HTMLElement | null>(null);
    const [view, setView] = useState<"curl" | "playground">("curl");
    // innerText will not be available if the content is virtualized
    const copyToClipboardContent = copyToClipboard ?? contentRef?.innerText;

    const shouldShowPlayground = endpoint?.queryParameters?.length > 0;

    const handleViewChange = (view: "curl" | "playground") => {
        view === "curl" ? setView("curl") : setView("playground");
    };
    return (
        <div
            className={classNames(
                "flex flex-col rounded-xl border border-border-default-light dark:border-border-default-dark overflow-scroll basis-full",
                className
            )}
            onClick={onClick}
            ref={ref}
        >
            <div
                className={classNames(
                    "border-border-default-light dark:border-border-default-dark flex h-10 items-center justify-between border-b py-1 pl-3 pr-2",
                    {
                        "bg-gray-200/90 dark:bg-[#19181C]": type === "primary",
                        "bg-red-500/20": type === "warning",
                    }
                )}
            >
                <div className="justify-middle flex gap-4">
                    <div
                        className={classNames("text-sm uppercase tracking-wide", {
                            "text-text-primary-light dark:text-text-muted-dark": type === "primary",
                            "text-red-400": type === "warning",
                        })}
                    >
                        request
                    </div>

                    <div className="rounded-sm bg-neutral-700 px-1 py-0.5 text-xs uppercase tracking-wide text-white">
                        {endpoint?.method}
                    </div>
                </div>

                <div className="flex gap-4 ">
                    <select
                        className="border-border-default-light dark:border-border-default-dark  rounded-lg border bg-transparent text-white"
                        name="lang"
                        id="api-lang"
                        onClick={() => handleViewChange("curl")}
                    >
                        <option value="">Node.js</option>
                    </select>

                    {shouldShowPlayground && (
                        <button
                            className="border-border-default-light dark:border-border-default-dark  rounded-lg border bg-stone-600 px-2 py-1 text-sm text-white"
                            onClick={() => handleViewChange("playground")}
                        >
                            Playground
                        </button>
                    )}

                    <CopyToClipboardButton content={copyToClipboardContent} />
                </div>
            </div>

            <div className="flex min-h-0 flex-1">
                <div
                    className={classNames(
                        "font-apiCode",
                        "flex flex-1 leading-relaxed text-xs min-w-0",
                        "typography-font-code",
                        className
                    )}
                >
                    <div
                        className={classNames(
                            "dark:bg-background-primary-dark flex-1 overflow-scroll whitespace-pre bg-gray-100/90 "
                        )}
                        ref={setContentRef}
                    >
                        {view === "curl" ? (
                            <CurlExample curlLines={data} selectedProperty={selectedProp} height={800} />
                        ) : (
                            shouldShowPlayground && (
                                <form className="p-4" action="" method="get">
                                    {endpoint?.queryParameters?.map((query) => (
                                        <div className="flex gap-4 [&:not(:first-child)]:mt-4" key={query.key}>
                                            <div className="flex basis-1/3 gap-4 ">
                                                <label className="text-white" htmlFor="TODO">
                                                    {query.key}
                                                </label>

                                                {/* <div className="text-red-300">required</div> */}
                                            </div>

                                            <input
                                                className="w-full rounded-sm p-2"
                                                type="text"
                                                name="TODO"
                                                id="TODO"
                                                required
                                                placeholder={query.key}
                                            />
                                        </div>
                                    ))}

                                    <button className="mt-4 w-full rounded-md bg-indigo-600 p-2 text-white">
                                        Run query
                                    </button>
                                </form>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
