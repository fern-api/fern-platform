import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { FernButton, Intent } from "@fern-ui/components";
import * as Select from "@radix-ui/react-select";
import clsx from "clsx";
import { Check, NavArrowDown, NavArrowUp } from "iconoir-react";
import { FC, Fragment, PropsWithChildren, ReactNode, forwardRef, useMemo } from "react";
import { statusCodeToIntent } from "../../components/StatusCodeTag";
import { CodeExample } from "../examples/code-example";
import { ExampleIndex, ExamplesByStatusCode, SelectedExampleKey, StatusCode } from "../types/EndpointContent";

export declare namespace ErrorExampleSelect {
    export interface Props {
        errors: readonly ApiDefinition.ErrorResponse[];
        selectedError: ApiDefinition.ErrorResponse | undefined;
        setSelectedErrorAndExample: (error: ApiDefinition.ErrorResponse | undefined) => void;
        selectedExampleKey: SelectedExampleKey | undefined;
        setSelectedExampleKey: (statusCode: StatusCode, exampleIndex: ExampleIndex) => void;
        examplesByStatusCode: ExamplesByStatusCode | undefined;
        getExampleTitle: (
            example: CodeExample | undefined,
            errorName: string | undefined,
            exampleIndex: number | undefined,
        ) => ReactNode;
    }
}

export const ErrorExampleSelect: FC<PropsWithChildren<ErrorExampleSelect.Props>> = ({
    errors,
    selectedError,
    setSelectedErrorAndExample,
    selectedExampleKey,
    setSelectedExampleKey,
    examplesByStatusCode,
    getExampleTitle,
}) => {
    const errorName = useMemo(
        () => (example: ApiDefinition.ExampleEndpointCall | undefined) => {
            const errorResponse = errors.find((e) => e.statusCode === example?.responseStatusCode);

            return errorResponse?.examples?.find((e) => e.name === example?.name)?.name ?? errorResponse?.name;
        },
        [errors],
    );
    const handleValueChange = (value: string) => {
        const [statusCode = 200, exampleIndex = 0] = value.split(":").map((v) => parseInt(v, 10));
        if (statusCode >= 400) {
            const errorIndex = errors.findIndex((e) => e.statusCode === statusCode);
            setSelectedErrorAndExample(errors[errorIndex]);
        } else {
            setSelectedErrorAndExample(undefined);
        }
        setSelectedExampleKey(statusCode, exampleIndex);
    };

    const selectedExample = useMemo(() => {
        if (selectedExampleKey == null) {
            return undefined;
        }
        const [_client, _title, statusCode = 200, exampleIndex = 0] = selectedExampleKey;
        return examplesByStatusCode?.[statusCode]?.[exampleIndex];
    }, [selectedExampleKey, examplesByStatusCode]);

    if (errors.length === 0) {
        return (
            <span className="t-muted text-sm">
                {getExampleTitle(selectedExample, selectedError?.examples?.[0]?.name ?? selectedError?.name, undefined)}
            </span>
        );
    }

    return (
        <Select.Root onValueChange={handleValueChange} value={getExampleKey(selectedExampleKey)}>
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
                    <Select.Value>
                        {getExampleTitle(
                            selectedExample,
                            selectedError?.examples?.[0]?.name ?? selectedError?.name,
                            undefined,
                        )}
                    </Select.Value>
                </FernButton>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content className="overflow-hidden rounded-md bg-card backdrop-blur shadow-2xl ring-default ring-inset ring-1 z-50">
                    <Select.ScrollUpButton className="t-accent flex h-8 cursor-default items-center justify-center bg-card">
                        <NavArrowUp className="size-icon" />
                    </Select.ScrollUpButton>
                    <Select.Viewport className="p-[5px]">
                        {examplesByStatusCode &&
                            Object.entries(examplesByStatusCode).map(([statusCode, examples]) => (
                                <Fragment key={statusCode}>
                                    <Select.Separator className="bg-tag-default m-[5px] h-px" />
                                    <Select.Group>
                                        {examples?.map((example, j) => {
                                            return (
                                                <FernSelectItem
                                                    value={`${statusCode}:${j}`}
                                                    key={j}
                                                    intent={statusCodeToIntent(Number(statusCode))}
                                                >
                                                    {getExampleTitle(
                                                        example,
                                                        errorName(example.exampleCall),
                                                        undefined,
                                                    )}
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

const getExampleKey = (key: SelectedExampleKey | undefined) => {
    if (key == null) {
        return undefined;
    }
    const [_, statusCode, exampleIndex] = key;
    if (statusCode == null || exampleIndex == null) {
        return undefined;
    }
    return `${statusCode}:${exampleIndex}`;
};
