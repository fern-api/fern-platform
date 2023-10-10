import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { MouseEventHandler, MutableRefObject, useState } from "react";
import { JsonPropertyPath } from "../api-page/examples/json-example/contexts/JsonPropertyPath";
import { JsonExampleVirtualized } from "../api-page/examples/json-example/JsonExample";
import { JsonLine } from "../api-page/examples/json-example/jsonLineUtils";
import { CopyToClipboardButton } from "../commons/CopyToClipboardButton";

interface Props {
    className?: string;
    ref?: MutableRefObject<HTMLDivElement | null>;
    type: "primary" | "warning";
    data: JsonLine[];
    example: FernRegistryApiRead.ExampleEndpointCall;
    selectedProp: JsonPropertyPath | undefined;
    onClick?: MouseEventHandler<HTMLDivElement>;
}

export default function ApiResponse({
    className,
    ref,
    type = "primary",
    data,
    example,
    selectedProp,
    onClick,
}: Props): JSX.Element {
    const [contentRef, setContentRef] = useState<HTMLElement | null>(null);

    // innerText will not be available if the content is virtualized
    return (
        <div
            className={classNames(
                "flex flex-col rounded-xl border border-border-default-light dark:border-border-default-dark overflow-hidden basis-full",
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
                        response
                    </div>

                    <div className="rounded-sm bg-green-500 px-1 py-0.5 text-xs uppercase tracking-wide text-white">
                        200
                    </div>
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
                            "dark:bg-background-primary-dark flex-1 overflow-hidden whitespace-pre bg-gray-100/90"
                        )}
                        ref={setContentRef}
                    >
                        <JsonExampleVirtualized jsonLines={data} selectedProperty={selectedProp} height={200} />
                    </div>
                </div>
            </div>
        </div>
    );
}
