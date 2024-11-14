import { FernButton, Intent } from "@fern-ui/components";
import * as Select from "@radix-ui/react-select";
import clsx from "clsx";
import { NavArrowDown, NavArrowUp } from "iconoir-react";
import { FC, Fragment, PropsWithChildren, ReactNode, forwardRef } from "react";
import { statusCodeToIntent } from "../../components/StatusCodeTag";
import { CodeExample } from "../examples/code-example";
import { ExamplesByStatusCode, StatusCode } from "../types/EndpointContent";

export declare namespace ErrorExampleSelect {
    export interface Props {
        selectedExample: CodeExample | undefined;
        examplesByStatusCode: ExamplesByStatusCode;
        setSelectedExampleKey: (statusCode: StatusCode, responseIndex: number) => void;
        getExampleId: (example: CodeExample | undefined) => ReactNode;
    }
}

export const ErrorExampleSelect: FC<PropsWithChildren<ErrorExampleSelect.Props>> = ({
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
        examplesByStatusCode[statusCode ?? ""]?.findIndex((example) => example.key === selectedExample?.key) ?? -1;

    return (
        <Select.Root
            onValueChange={handleValueChange}
            value={statusCode != null && responseIndex >= 0 ? `${statusCode}:${responseIndex}` : undefined}
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
                            ? statusCodeToIntent(selectedExample.exampleCall.responseStatusCode)
                            : "none"
                    }
                >
                    <Select.Value>{getExampleId(selectedExample)}</Select.Value>
                </FernButton>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content className="overflow-hidden rounded-md bg-card backdrop-blur shadow-2xl ring-default ring-inset ring-1 z-50">
                    <Select.ScrollUpButton className="t-accent flex h-8 cursor-default items-center justify-center bg-card">
                        <NavArrowUp className="size-icon" />
                    </Select.ScrollUpButton>
                    <Select.Viewport className="p-[5px]">
                        {Object.entries(examplesByStatusCode).map(([statusCode, examples], idx) => (
                            <Fragment key={statusCode}>
                                {idx > 0 && <Select.Separator className="bg-tag-default m-[5px] h-px" />}
                                <Select.Group>
                                    {examples.map((example, j) => {
                                        return (
                                            <FernSelectItem
                                                value={`${statusCode}:${j}`}
                                                key={j}
                                                intent={statusCodeToIntent(Number(statusCode))}
                                            >
                                                {getExampleId(example)}
                                            </FernSelectItem>
                                        );
                                    })}
                                </Select.Group>
                            </Fragment>
                        ))}
                    </Select.Viewport>
                    <Select.ScrollDownButton className="t-accent flex h-8 cursor-default items-center justify-center bg-card">
                        <NavArrowDown className="size-icon" />
                    </Select.ScrollDownButton>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
};

export const FernSelectItem = forwardRef<
    HTMLDivElement,
    Select.SelectItemProps & { textClassName?: string; intent?: Intent }
>(function FernSelectItem({ children, className, textClassName, intent = "none", ...props }, forwardedRef) {
    return (
        <Select.Item
            className={clsx(
                "text-text-default data-[disabled]:text-text-disabled relative flex h-8 select-none items-center rounded-[3px] pl-2 pr-4 text-sm leading-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none",
                {
                    "data-[highlighted]:bg-tag-default": intent === "none" || intent === "primary",
                    "data-[highlighted]:bg-tag-warning": intent === "warning",
                    "data-[highlighted]:bg-tag-success": intent === "success",
                    "data-[highlighted]:bg-tag-danger": intent === "danger",
                },
                className,
            )}
            {...props}
            ref={forwardedRef}
        >
            <Select.ItemText className={textClassName}>{children}</Select.ItemText>
        </Select.Item>
    );
});
