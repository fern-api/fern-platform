import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import React from "react";
import { CheckIcon } from "../../commons/icons/CheckIcon";
import { InfoIcon } from "../../commons/icons/InfoIcon";
import { WarningIcon } from "../../commons/icons/WarningIcon";
import styles from "./Callout.module.scss";

export declare namespace Callout {
    export interface Props {
        intent: "info" | "warning" | "success";
    }
}

export const Callout: React.FC<React.PropsWithChildren<Callout.Props>> = ({ intent, children }) => {
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
            {visitDiscriminatedUnion({ intent }, "intent")._visit({
                info: () => <InfoIcon className="text-intent-default h-5 w-5 min-w-fit" />,
                warning: () => (
                    <WarningIcon className="text-intent-warning-light dark:text-intent-warning-dark h-5 w-5 min-w-fit" />
                ),
                success: () => (
                    <CheckIcon className="text-intent-success-light dark:text-intent-success-dark h-5 w-5 min-w-fit" />
                ),
                _other: () => null,
            })}
            <div className="text-sm leading-5">
                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
};
