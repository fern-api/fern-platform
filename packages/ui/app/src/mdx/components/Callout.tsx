import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import React from "react";
import { CheckIcon } from "../../commons/icons/CheckIcon";
import { InfoIcon } from "../../commons/icons/InfoIcon";
import { WarningIcon } from "../../commons/icons/WarningIcon";
import styles from "./Callout.module.scss";

type Intent = "info" | "warning" | "success";

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
    } else {
        return "info";
    }
}

export const Callout: React.FC<React.PropsWithChildren<Callout.Props>> = ({ intent: intentRaw, children }) => {
    const intent = parseIntent(intentRaw);
    return (
        <div
            className={classNames("flex space-x-3 px-4 pt-4 pb-1 border rounded-lg", {
                "bg-tag-default-light dark:bg-tag-default-dark border-border-default-light dark:border-border-default-dark":
                    intent === "info",
                "bg-tag-warning-light dark:bg-tag-warning-dark border-border-warning-light dark:border-border-warning-dark":
                    intent === "warning",
                "bg-tag-success-light dark:bg-tag-success-dark border-border-success-light dark:border-border-success-dark":
                    intent === "success",
            })}
        >
            <div className="min-w-fit">
                {visitDiscriminatedUnion({ intent }, "intent")._visit({
                    info: () => <InfoIcon className="text-intent-default h-5 w-5" />,
                    warning: () => (
                        <WarningIcon className="text-intent-warning-light dark:text-intent-warning-dark h-5 w-5" />
                    ),
                    success: () => (
                        <CheckIcon className="text-intent-success-light dark:text-intent-success-dark h-5 w-5" />
                    ),
                    _other: () => null,
                })}
            </div>

            <div className="text-sm leading-5">
                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
};
