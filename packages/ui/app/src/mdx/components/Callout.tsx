import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { CheckCircledIcon, ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import React from "react";
import styles from "./Callout.module.scss";

type Intent = "info" | "warning" | "success" | "danger";

export declare namespace Callout {
    export interface Props {
        intent: string;
    }
}

function parseIntent(type: unknown): Intent {
    if (typeof type !== "string") {
        return "info";
    } else if (type.toLowerCase() === "info") {
        return "info";
    } else if (type.toLowerCase() === "warning") {
        return "warning";
    } else if (type.toLowerCase() === "success") {
        return "success";
    } else if (type.toLowerCase() === "danger") {
        return "danger";
    } else {
        return "info";
    }
}

export const Callout: React.FC<React.PropsWithChildren<Callout.Props>> = ({ intent: intentRaw, children }) => {
    const intent = parseIntent(intentRaw);
    return (
        <div
            className={classNames(
                "flex space-x-3 p-4 pb-0 mb-4 rounded-lg", // pb-0 to compensate for the ::after margin
                visitDiscriminatedUnion({ intent }, "intent")._visit({
                    info: () => "callout-outlined",
                    warning: () => "callout-outlined-warning",
                    success: () => "callout-outlined-success",
                    danger: () => "callout-outlined-danger",
                    _other: () => "",
                }),
            )}
        >
            <div className="min-w-fit">
                {visitDiscriminatedUnion({ intent }, "intent")._visit({
                    info: () => (
                        <InfoCircledIcon className="text-intent-default dark:text-intent-default-dark size-5" />
                    ),
                    warning: () => <ExclamationTriangleIcon className="text-intent-warning size-5" />,
                    success: () => <CheckCircledIcon className="text-intent-success size-5" />,
                    danger: () => <ExclamationTriangleIcon className="text-intent-danger size-5" />,
                    _other: () => null,
                })}
            </div>

            <div
                className={classNames(
                    "text-sm leading-5 w-full after:block after:mt-4", // ::after margin ensures that bottom padding overlaps with botttom margins of internal content
                    visitDiscriminatedUnion({ intent }, "intent")._visit({
                        info: () => "text-intent-default",
                        warning: () => "text-intent-warning",
                        success: () => "text-intent-success",
                        danger: () => "text-intent-danger",
                        _other: () => "",
                    }),
                )}
            >
                <div className={classNames(styles.content, "not-prose")}>{children}</div>
            </div>
        </div>
    );
};
