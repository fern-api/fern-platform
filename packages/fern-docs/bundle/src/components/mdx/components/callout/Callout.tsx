import { FC, PropsWithChildren, ReactElement, isValidElement } from "react";

import {
  Bell,
  Check,
  CheckCircle,
  InfoCircle,
  Pin,
  Rocket,
  Star,
  WarningTriangle,
} from "iconoir-react";

import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { cn } from "@fern-docs/components";
import { FaIcon } from "@fern-docs/components";

type Intent =
  | "info"
  | "warning"
  | "success"
  | "error"
  | "note"
  | "launch"
  | "tip"
  | "check";

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

export const Callout: FC<PropsWithChildren<Callout.Props>> = ({
  intent: intentRaw,
  title,
  children,
  icon,
}) => {
  const intent = parseIntent(intentRaw);
  return (
    <div
      className={cn(
        "mt-4 mb-6 rounded-lg p-4 first:mt-0", // pb-0 to compensate for the ::after margin
        visitDiscriminatedUnion({ intent }, "intent")._visit({
          info: () => "callout-outlined",
          warning: () => "callout-outlined-warning",
          success: () => "callout-outlined-success",
          error: () => "callout-outlined-danger",
          note: () => "callout-outlined-info",
          launch: () => "callout-outlined-primary",
          tip: () => "callout-outlined-tip",
          check: () => "callout-outlined-check",
          _other: () => "callout-outlined",
        })
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="mt-0.5 w-4">
          {typeof icon === "string" ? (
            <FaIcon
              className={cn("card-icon size-icon-md", {
                "text-body": intent === "info",
                "text-intent-warning": intent === "warning",
                "text-intent-success": intent === "success",
                "text-intent-danger": intent === "error",
                "text-intent-info": intent === "note",
                "text-accent": intent === "launch",
              })}
              icon={icon}
            />
          ) : isValidElement(icon) ? (
            <span className="callout-icon">{icon}</span>
          ) : (
            visitDiscriminatedUnion({ intent }, "intent")._visit({
              info: () => <InfoCircle className="text-body size-icon-md" />,
              warning: () => (
                <Bell className="size-icon-md text-intent-warning" />
              ),
              success: () => (
                <CheckCircle className="size-icon-md text-intent-success" />
              ),
              error: () => (
                <WarningTriangle className="size-icon-md text-intent-danger" />
              ),
              note: () => <Pin className="size-icon-md text-intent-info" />,
              launch: () => <Rocket className="text-accent size-icon-md" />,
              tip: () => <Star className="size-icon-md text-intent-success" />,
              check: () => (
                <Check className="size-icon-md text-intent-success" />
              ),
              _other: () => <InfoCircle className="text-body size-icon-md" />,
            })
          )}
        </div>

        <div
          className={cn(
            "prose prose-sm dark:prose-invert -my-4 flex-1 overflow-x-auto before:mb-4 before:block after:mt-4 after:block" // ::after margin ensures that bottom padding overlaps with botttom margins of internal content
          )}
        >
          <div
            className={visitDiscriminatedUnion({ intent }, "intent")._visit({
              info: () => "text-body",
              warning: () => "text-intent-warning",
              success: () => "text-intent-success",
              error: () => "text-intent-danger",
              note: () => "text-intent-info",
              launch: () => "text-accent",
              tip: () => "text-intent-success",
              check: () => "text-intent-success",
              _other: () => "text-body",
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

export function InfoCallout({
  children,
  ...props
}: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement<any> {
  return (
    <Callout intent="info" {...props}>
      {children}
    </Callout>
  );
}

export function WarningCallout({
  children,
  ...props
}: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement<any> {
  return (
    <Callout intent="warning" {...props}>
      {children}
    </Callout>
  );
}

export function SuccessCallout({
  children,
  ...props
}: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement<any> {
  return (
    <Callout intent="success" {...props}>
      {children}
    </Callout>
  );
}

export function ErrorCallout({
  children,
  ...props
}: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement<any> {
  return (
    <Callout intent="error" {...props}>
      {children}
    </Callout>
  );
}

export function NoteCallout({
  children,
  ...props
}: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement<any> {
  return (
    <Callout intent="note" {...props}>
      {children}
    </Callout>
  );
}

export function LaunchNoteCallout({
  children,
  ...props
}: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement<any> {
  return (
    <Callout intent="launch" {...props}>
      {children}
    </Callout>
  );
}

export function TipCallout({
  children,
  ...props
}: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement<any> {
  return (
    <Callout intent="tip" {...props}>
      {children}
    </Callout>
  );
}

export function CheckCallout({
  children,
  ...props
}: PropsWithChildren<Omit<Callout.Props, "intent">>): ReactElement<any> {
  return (
    <Callout intent="check" {...props}>
      {children}
    </Callout>
  );
}
