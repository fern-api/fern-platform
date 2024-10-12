import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { FernButton, Intent } from "@fern-ui/components";
import * as Select from "@radix-ui/react-select";
import clsx from "clsx";
import { Check, NavArrowDown, NavArrowUp } from "iconoir-react";
import { FC, Fragment, PropsWithChildren, forwardRef } from "react";
import { StatusCodeTag, statusCodeToIntent } from "../../components/StatusCodeTag";

export declare namespace ErrorExampleSelect {
    export interface Props {
        selectedError: ApiDefinition.ErrorResponse | undefined;
        selectedErrorExample: ApiDefinition.ErrorExample | undefined;
        errors: readonly ApiDefinition.ErrorResponse[];
        setSelectedErrorAndExample: (
            error: ApiDefinition.ErrorResponse | undefined,
            example: ApiDefinition.ErrorExample | undefined,
        ) => void;
    }
}

export const ErrorExampleSelect: FC<PropsWithChildren<ErrorExampleSelect.Props>> = ({
    selectedError,
    selectedErrorExample,
    errors,
    setSelectedErrorAndExample,
    children,
}) => {
    const handleValueChange = (value: string) => {
        const [errorIndex = 0, exampleIndex = 0] = value.split(":").map((v) => parseInt(v, 10));
        setSelectedErrorAndExample(errors[errorIndex], errors[errorIndex]?.examples?.[exampleIndex]);
    };
    const selectedErrorIndex = selectedError != null ? errors.indexOf(selectedError) : -1;
    const selectedExampleIndex =
        selectedError != null && selectedErrorExample != null
            ? selectedError?.examples?.indexOf(selectedErrorExample) ?? -1
            : -1;

    const value = `${selectedErrorIndex}:${selectedExampleIndex}`;

    if (errors.length === 0) {
        return <span className="t-muted text-sm">{children}</span>;
    }

    const renderValue = () => {
        if (selectedError != null) {
            const content = `${
                selectedError.examples && selectedError.examples.length > 1
                    ? `${selectedError.name} Example ${selectedExampleIndex + 1}`
                    : selectedError.name
            }`;
            return (
                <span className={clsx("inline-flex gap-2 items-center")}>
                    <StatusCodeTag statusCode={selectedError.statusCode} />
                    <span className={`text-intent-${statusCodeToIntent(selectedError.statusCode)}`}>
                        {selectedErrorExample?.name ?? content}
                    </span>
                </span>
            );
        } else {
            return children ?? "Response";
        }
    };

    return (
        <Select.Root onValueChange={handleValueChange} value={value}>
            <Select.Trigger asChild={true}>
                <FernButton
                    rightIcon={
                        <Select.Icon>
                            <NavArrowDown className="size-icon" />
                        </Select.Icon>
                    }
                    variant="minimal"
                    className="-ml-1 pl-1"
                    intent={selectedError != null ? statusCodeToIntent(selectedError.statusCode) : "none"}
                >
                    <Select.Value>{renderValue()}</Select.Value>
                </FernButton>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content className="overflow-hidden rounded-md bg-card backdrop-blur shadow-2xl ring-default ring-inset ring-1 z-50">
                    <Select.ScrollUpButton className="t-accent flex h-8 cursor-default items-center justify-center bg-card">
                        <NavArrowUp className="size-icon" />
                    </Select.ScrollUpButton>
                    <Select.Viewport className="p-[5px]">
                        <Select.Group>
                            <FernSelectItem value="-1:-1">{children ?? "Response"}</FernSelectItem>
                        </Select.Group>
                        {errors.map((error, i) => (
                            <Fragment key={i}>
                                <Select.Separator className="bg-tag-default m-[5px] h-px" />
                                <Select.Group>
                                    {error.examples?.map((example, j) => (
                                        <FernSelectItem
                                            value={`${i}:${j}`}
                                            key={j}
                                            intent={statusCodeToIntent(error.statusCode)}
                                        >
                                            <span className="inline-flex gap-2 items-center">
                                                <StatusCodeTag statusCode={error.statusCode} />
                                                <span className={`text-intent-${statusCodeToIntent(error.statusCode)}`}>
                                                    {example.name ??
                                                        (error.examples && error.examples.length > 1
                                                            ? `${error.name} Example ${j + 1}`
                                                            : error.name)}
                                                </span>
                                            </span>
                                        </FernSelectItem>
                                    ))}
                                    {!error.examples ||
                                        (error.examples.length === 0 && (
                                            <FernSelectItem
                                                value={`${i}:-1`}
                                                intent={statusCodeToIntent(error.statusCode)}
                                            >
                                                <span className="inline-flex gap-2 items-center">
                                                    <StatusCodeTag statusCode={error.statusCode} />
                                                    <span
                                                        className={`text-intent-${statusCodeToIntent(error.statusCode)}`}
                                                    >
                                                        {error.name}
                                                    </span>
                                                </span>
                                            </FernSelectItem>
                                        ))}
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
                "text-text-default data-[disabled]:text-text-disabled relative flex h-8 select-none items-center rounded-[3px] pl-[25px] pr-[35px] text-sm leading-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none",
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
            <Select.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
                <Check className="size-icon" />
            </Select.ItemIndicator>
        </Select.Item>
    );
});
