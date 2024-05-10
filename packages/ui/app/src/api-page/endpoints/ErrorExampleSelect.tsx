import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import * as Select from "@radix-ui/react-select";
import clsx from "clsx";
import { FC, Fragment, PropsWithChildren, forwardRef } from "react";
import { FernButton } from "../../components/FernButton";
import { FernTag } from "../../components/FernTag";
import { ResolvedError, ResolvedExampleError } from "../../resolver/types";
import { getMessageForStatus } from "../utils/getMessageForStatus";

export declare namespace ErrorExampleSelect {
    export interface Props {
        selectedError: ResolvedError | undefined;
        selectedErrorExample: ResolvedExampleError | undefined;
        errors: ResolvedError[];
        setSelectedErrorAndExample: (
            error: ResolvedError | undefined,
            example: ResolvedExampleError | undefined,
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
        const [errorIndex, exampleIndex] = value.split(":").map((v) => parseInt(v, 10));
        setSelectedErrorAndExample(errors[errorIndex], errors[errorIndex]?.examples[exampleIndex]);
    };
    const selectedErrorIndex = selectedError != null ? errors.indexOf(selectedError) : -1;
    const selectedExampleIndex =
        selectedError != null && selectedErrorExample != null
            ? selectedError?.examples.indexOf(selectedErrorExample)
            : -1;

    const value = `${selectedErrorIndex}:${selectedExampleIndex}`;

    if (errors.length === 0) {
        return <span className="t-muted text-sm">{children}</span>;
    }

    const renderValue = () => {
        if (selectedError != null && selectedErrorExample?.name != null) {
            return (
                <span className="text-intent-danger inline-flex gap-2 items-center">
                    <FernTag colorScheme="red">{selectedError.statusCode}</FernTag>
                    {selectedErrorExample.name}
                </span>
            );
        } else if (selectedError != null && selectedExampleIndex >= 0) {
            const content = `${
                selectedError.examples.length > 1
                    ? `${selectedError.name ?? getMessageForStatus(selectedError.statusCode)} Example ${selectedExampleIndex + 1}`
                    : selectedError.name ?? getMessageForStatus(selectedError.statusCode)
            }`;
            return (
                <span className="text-intent-danger inline-flex gap-2 items-center">
                    <FernTag colorScheme="red">{selectedError.statusCode}</FernTag>
                    {content}
                </span>
            );
        } else if (selectedError != null) {
            return (
                <span className="text-intent-danger inline-flex gap-2 items-center">
                    <FernTag colorScheme="red">{selectedError.statusCode}</FernTag>
                    {selectedError.name ?? getMessageForStatus(selectedError.statusCode)}
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
                            <ChevronDownIcon />
                        </Select.Icon>
                    }
                    variant="minimal"
                    className="-ml-1 pl-1"
                    intent={selectedError != null ? "danger" : "none"}
                >
                    <Select.Value>{renderValue()}</Select.Value>
                </FernButton>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content className="overflow-hidden rounded-md bg-card backdrop-blur shadow-2xl ring-default ring-inset ring-1 z-50">
                    <Select.ScrollUpButton className="text-violet11 flex h-8 cursor-default items-center justify-center bg-white">
                        <ChevronUpIcon />
                    </Select.ScrollUpButton>
                    <Select.Viewport className="p-[5px]">
                        <Select.Group>
                            <FernSelectItem value="-1:-1">{children ?? "Response"}</FernSelectItem>
                        </Select.Group>
                        {errors.map((error, i) => (
                            <Fragment key={i}>
                                <Select.Separator className="bg-tag-default m-[5px] h-px" />
                                <Select.Group>
                                    {/* <Select.Label className="t-danger px-[25px] text-sm leading-[25px] flex gap-2 items-center">
                                        <FernTag colorScheme="red">
                                            {error.statusCode}
                                        </FernTag>
                                        <span>{error.name ?? getMessageForStatus(error.statusCode)}</span>
                                    </Select.Label> */}
                                    {error.examples.map((example, j) => (
                                        <FernSelectItem value={`${i}:${j}`} key={j} intent="danger">
                                            <span className="text-intent-danger inline-flex gap-2 items-center">
                                                <FernTag colorScheme="red">{error.statusCode}</FernTag>
                                                {example.name ??
                                                    (error.examples.length > 1
                                                        ? `${error.name ?? getMessageForStatus(error.statusCode)} Example ${j + 1}`
                                                        : error.name ?? getMessageForStatus(error.statusCode))}
                                            </span>
                                        </FernSelectItem>
                                    ))}
                                    {error.examples.length === 0 && (
                                        <FernSelectItem value={`${i}:-1`} intent="danger">
                                            <span className="text-intent-danger inline-flex gap-2 items-center">
                                                <FernTag colorScheme="red">{error.statusCode}</FernTag>
                                                {`${error.name ?? getMessageForStatus(error.statusCode)}`}
                                            </span>
                                        </FernSelectItem>
                                    )}
                                </Select.Group>
                            </Fragment>
                        ))}
                    </Select.Viewport>
                    <Select.ScrollDownButton className="text-violet11 flex h-8 cursor-default items-center justify-center bg-white">
                        <ChevronDownIcon />
                    </Select.ScrollDownButton>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
};

export const FernSelectItem = forwardRef<
    HTMLDivElement,
    Select.SelectItemProps & { textClassName?: string; intent?: "default" | "danger" }
>(function FernSelectItem({ children, className, textClassName, intent = "default", ...props }, forwardedRef) {
    return (
        <Select.Item
            className={clsx(
                "text-text-default data-[disabled]:text-text-disabled relative flex h-8 select-none items-center rounded-[3px] pl-[25px] pr-[35px] text-sm leading-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none",
                {
                    "data-[highlighted]:bg-tag-default": intent === "default",
                    "data-[highlighted]:bg-tag-danger": intent === "danger",
                },
                className,
            )}
            {...props}
            ref={forwardedRef}
        >
            <Select.ItemText className={textClassName}>{children}</Select.ItemText>
            <Select.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
                <CheckIcon />
            </Select.ItemIndicator>
        </Select.Item>
    );
});
