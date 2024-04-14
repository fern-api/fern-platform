import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import {
    BellIcon,
    CheckCircledIcon,
    CheckIcon,
    DrawingPinIcon,
    ExclamationTriangleIcon,
    InfoCircledIcon,
    RocketIcon,
    StarIcon,
} from "@radix-ui/react-icons";
import cn from "clsx";
import { FC, PropsWithChildren, ReactElement, isValidElement } from "react";
import { RemoteFontAwesomeIcon } from "../../commons/FontAwesomeIcon";

type Intent = "info" | "warning" | "success" | "error" | "note" | "launch" | "tip" | "check";

export declare namespace Callout {
    export interface Props {
        intent: string;
        title?: string;
        icon?: unknown;
    }
}

function parseIntent(unknownIntent: unknown): Intent {
    if (typeof unknownIntent !== "string") {
        return "info";
    }

    return unknownIntent.trim().toLowerCase() as Intent;
}

export const Callout: FC<PropsWithChildren<Callout.Props>> = ({ intent: intentRaw, title, children, icon }) => {
    const intent = parseIntent(intentRaw);
    return (
        <div
            className={cn(
                "p-4 mt-4 first:mt-0 mb-6 rounded-lg", // pb-0 to compensate for the ::after margin
                visitDiscriminatedUnion({ intent }, "intent")._visit({
                    info: () => "callout-outlined",
                    warning: () => "callout-outlined-warning",
                    success: () => "callout-outlined-success",
                    error: () => "callout-outlined-danger",
                    note: () => "callout-outlined-info",
                    launch: () => "callout-outlined-primary",
                    tip: () => "callout-outlined-success",
                    check: () => "callout-outlined-success",
                    _other: () => "callout-outlined",
                }),
            )}
        >
            <div className="flex items-start space-x-3">
                <div className="mt-0.5 w-4">
                    {typeof icon === "string" ? (
                        <RemoteFontAwesomeIcon
                            className={cn("card-icon size-5", {
                                "bg-intent-default": intent === "info",
                                "bg-intent-warning": intent === "warning",
                                "bg-intent-success": intent === "success",
                                "bg-intent-danger": intent === "error",
                                "bg-intent-info": intent === "note",
                                "bg-accent": intent === "launch",
                            })}
                            icon={icon}
                        />
                    ) : isValidElement(icon) ? (
                        <span className="callout-icon">{icon}</span>
                    ) : (
                        visitDiscriminatedUnion({ intent }, "intent")._visit({
                            info: () => <InfoCircledIcon className="text-intent-default size-5" />,
                            warning: () => <BellIcon className="text-intent-warning size-5" />,
                            success: () => <CheckCircledIcon className="text-intent-success size-5" />,
                            error: () => <ExclamationTriangleIcon className="text-intent-danger size-5" />,
                            note: () => <DrawingPinIcon className="text-intent-info size-5" />,
                            launch: () => <RocketIcon className="t-accent size-5" />,
                            tip: () => <StarIcon className="text-intent-success size-5" />,
                            check: () => <CheckIcon className="text-intent-success size-5" />,
                            _other: () => <InfoCircledIcon className="text-intent-default size-5" />,
                        })
                    )}
                </div>

                <div
                    className={cn(
                        "flex-1 prose-sm prose dark:prose-invert overflow-x-auto -my-4 after:block after:mt-4 before:block before:mb-4", // ::after margin ensures that bottom padding overlaps with botttom margins of internal content
                    )}
                >
                    <div
                        className={visitDiscriminatedUnion({ intent }, "intent")._visit({
                            info: () => "text-intent-default",
                            warning: () => "text-intent-warning",
                            success: () => "text-intent-success",
                            error: () => "text-intent-danger",
                            note: () => "text-intent-info",
                            launch: () => "t-accent",
                            tip: () => "text-intent-success",
                            check: () => "text-intent-success",
                            _other: () => "text-intent-default",
                        })}
                    >
                        <h5 className="leading-snug">{title}</h5>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// aliases

export function InfoCallout({ children, title }: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement {
    return (
        <Callout intent="info" title={title}>
            {children}
        </Callout>
    );
}

export function WarningCallout({ children, title }: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement {
    return (
        <Callout intent="warning" title={title}>
            {children}
        </Callout>
    );
}

export function SuccessCallout({ children, title }: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement {
    return (
        <Callout intent="success" title={title}>
            {children}
        </Callout>
    );
}

export function ErrorCallout({ children, title }: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement {
    return (
        <Callout intent="error" title={title}>
            {children}
        </Callout>
    );
}

export function NoteCallout({ children, title }: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement {
    return (
        <Callout intent="note" title={title}>
            {children}
        </Callout>
    );
}

export function LaunchNoteCallout({ children, title }: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement {
    return (
        <Callout intent="launch" title={title}>
            {children}
        </Callout>
    );
}

export function TipCallout({ children, title }: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement {
    return (
        <Callout intent="tip" title={title}>
            {children}
        </Callout>
    );
}

export function CheckCallout({ children, title }: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement {
    return (
        <Callout intent="check" title={title}>
            {children}
        </Callout>
    );
}
