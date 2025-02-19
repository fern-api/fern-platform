import { FC, Fragment, PropsWithChildren, ReactNode, forwardRef } from "react";

import * as Select from "@radix-ui/react-select";
import { NavArrowDown, NavArrowUp } from "iconoir-react";

import { cn } from "@fern-docs/components";
import {
  FernButton,
  SemanticColor,
  statusCodeToIntent,
} from "@fern-docs/components";

import { CodeExample } from "../examples/code-example";
import {
  ExamplesByStatusCode,
  StatusCode,
} from "../type-definitions/EndpointContent";

export declare namespace ErrorExampleSelect {
  export interface Props {
    selectedExample: CodeExample | undefined;
    examplesByStatusCode: ExamplesByStatusCode;
    setSelectedExampleKey: (
      statusCode: StatusCode,
      responseIndex: number
    ) => void;
    getExampleId: (example: CodeExample | undefined) => ReactNode;
  }
}

export const ErrorExampleSelect: FC<
  PropsWithChildren<ErrorExampleSelect.Props>
> = ({
  selectedExample,
  setSelectedExampleKey,
  examplesByStatusCode,
  getExampleId,
}) => {
  const handleValueChange = (value: string) => {
    const [statusCode, responseIndex] = value.split(":");
    setSelectedExampleKey(String(statusCode ?? ""), Number(responseIndex ?? 0));
  };

  const statusCode = selectedExample?.exampleCall.responseStatusCode;
  const responseIndex =
    examplesByStatusCode[statusCode ?? ""]?.findIndex(
      (example) => example.key === selectedExample?.key
    ) ?? -1;

  return (
    <Select.Root
      onValueChange={handleValueChange}
      value={
        statusCode != null && responseIndex >= 0
          ? `${statusCode}:${responseIndex}`
          : undefined
      }
    >
      <Select.Trigger asChild={true}>
        <FernButton
          rightIcon={
            <Select.Icon>
              <NavArrowDown className="size-icon" />
            </Select.Icon>
          }
          variant="minimal"
          className="-ml-1 pl-1"
          intent={
            selectedExample != null
              ? statusCodeToIntent(
                  String(selectedExample.exampleCall.responseStatusCode)
                )
              : "none"
          }
        >
          <Select.Value>{getExampleId(selectedExample)}</Select.Value>
        </FernButton>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="bg-card-background ring-border-default z-50 overflow-hidden rounded-md shadow-2xl ring-1 ring-inset backdrop-blur">
          <Select.ScrollUpButton className="text-accent-a11 bg-card-background flex h-8 cursor-default items-center justify-center">
            <NavArrowUp className="size-icon" />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-[5px]">
            {Object.entries(examplesByStatusCode).map(
              ([statusCode, examples], idx) => (
                <Fragment key={statusCode}>
                  {idx > 0 && (
                    <Select.Separator className="bg-tag-default m-[5px] h-px" />
                  )}
                  <Select.Group>
                    {examples.map((example, j) => {
                      return (
                        <FernSelectItem
                          value={`${statusCode}:${j}`}
                          key={j}
                          intent={statusCodeToIntent(statusCode)}
                        >
                          {getExampleId(example)}
                        </FernSelectItem>
                      );
                    })}
                  </Select.Group>
                </Fragment>
              )
            )}
          </Select.Viewport>
          <Select.ScrollDownButton className="text-accent-a11 bg-card-background flex h-8 cursor-default items-center justify-center">
            <NavArrowDown className="size-icon" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export const FernSelectItem = forwardRef<
  HTMLDivElement,
  Select.SelectItemProps & { textClassName?: string; intent?: SemanticColor }
>(function FernSelectItem(
  { children, className, textClassName, intent = "none", ...props },
  forwardedRef
) {
  return (
    <Select.Item
      className={cn(
        "text-body data-[disabled]:text-disabled relative flex h-8 select-none items-center rounded-[3px] pl-2 pr-4 text-sm leading-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none",
        {
          "data-[highlighted]:bg-tag-default":
            intent === "none" || intent === "primary",
          "data-[highlighted]:bg-tag-warning": intent === "warning",
          "data-[highlighted]:bg-tag-success": intent === "success",
          "data-[highlighted]:bg-tag-danger": intent === "danger",
        },
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <Select.ItemText className={textClassName}>{children}</Select.ItemText>
    </Select.Item>
  );
});
