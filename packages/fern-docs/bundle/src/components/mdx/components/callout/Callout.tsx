import { FC, PropsWithChildren, ReactElement, isValidElement } from "react";

import {
  Bell,
  Check,
  CheckCircle,
  Info,
  Pin,
  Rocket,
  Star,
  TriangleAlert,
} from "lucide-react";

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
        "rounded-2 mb-6 mt-4 border p-4 first:mt-0", // pb-0 to compensate for the ::after margin
        visitDiscriminatedUnion({ intent }, "intent")._visit({
          info: () =>
            "bg-(color:--grayscale-a2) border-(color:--grayscale-a6) text-(color:--grayscale-a11) [&_svg]:text-(color:--grayscale-a10)",
          warning: () =>
            "bg-(color:--amber-a2) border-(color:--amber-a6) text-(color:--amber-a11) [&_svg]:text-(color:--amber-a10)",
          success: () =>
            "bg-(color:--green-a2) border-(color:--green-a6) text-(color:--green-a11) [&_svg]:text-(color:--green-a10)",
          error: () =>
            "bg-(color:--red-a2) border-(color:--red-a6) text-(color:--red-a11) [&_svg]:text-(color:--red-a10)",
          note: () =>
            "bg-(color:--blue-a2) border-(color:--blue-a6) text-(color:--blue-a11) [&_svg]:text-(color:--blue-a10)",
          launch: () =>
            "bg-(color:--accent-a2) border-(color:--accent-a6) text-(color:--accent-a11) [&_svg]:text-(color:--accent-a10)",
          tip: () =>
            "bg-(color:--green-a2) border-(color:--green-a6) text-(color:--green-a11) [&_svg]:text-(color:--green-a10)",
          check: () =>
            "bg-(color:--green-a2) border-(color:--green-a6) text-(color:--green-a11) [&_svg]:text-(color:--green-a10)",
          _other: () =>
            "bg-(color:--grayscale-a2) border-(color:--grayscale-a6) text-(color:--grayscale-a11) [&_svg]:text-(color:--grayscale-a10)",
        })
      )}
    >
      <div className="flex items-start space-x-4">
        <div className="[&_svg]:size-icon-md mt-0.5 w-4">
          {typeof icon === "string" ? (
            <FaIcon icon={icon} />
          ) : isValidElement(icon) ? (
            icon
          ) : (
            visitDiscriminatedUnion({ intent }, "intent")._visit({
              info: () => <Info />,
              warning: () => <Bell />,
              success: () => <CheckCircle />,
              error: () => <TriangleAlert />,
              note: () => <Pin />,
              launch: () => <Rocket />,
              tip: () => <Star />,
              check: () => <Check />,
              _other: () => <Info />,
            })
          )}
        </div>

        <div
          className={cn(
            "-my-4 flex-1 overflow-x-auto text-sm before:mb-4 before:block after:mt-4 after:block" // ::after margin ensures that bottom padding overlaps with botttom margins of internal content
          )}
        >
          <h5 className="leading-snug">{title}</h5>
          {children}
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
