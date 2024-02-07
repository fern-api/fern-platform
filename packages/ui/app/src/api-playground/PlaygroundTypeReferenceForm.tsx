import { Switch } from "@blueprintjs/core";
import { DateInput3 } from "@blueprintjs/datetime2";
import { ResolvedObjectProperty, ResolvedTypeReference } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { Transition } from "@headlessui/react";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { FC, PropsWithChildren, useEffect } from "react";
import { FernButton } from "../components/FernButton";
import { FernInput } from "../components/FernInput";
import { FernNumericInput } from "../components/FernNumericInput";
import { FernTextarea } from "../components/FernTextarea";
import { PlaygroundDiscriminatedUnionForm } from "./PlaygroundDescriminatedUnionForm";
import { PlaygroundEnumForm } from "./PlaygroundEnumForm";
import { PlaygroundListForm } from "./PlaygroundListForm";
import { PlaygroundMapForm } from "./PlaygroundMapForm";
import { PlaygroundObjectPropertiesForm } from "./PlaygroundObjectPropertyForm";
import { PlaygroundUniscriminatedUnionForm } from "./PlaygroundUniscriminatedUnionForm";

interface PlaygroundTypeReferenceFormProps {
    shape: ResolvedTypeReference;
    onChange: (value: unknown) => void;
    value?: unknown;
    onFocus?: () => void;
    onBlur?: () => void;
    onOpenStack?: () => void;
    onCloseStack?: () => void;
    renderAsPanel?: boolean;
    onlyRequired?: boolean;
    onlyOptional?: boolean;
    hideObjects?: boolean;
    sortProperties?: boolean;
}

interface WithPanelProps {
    value: unknown;
    renderAsPanel: boolean;
    onOpenStack?: () => void;
    onCloseStack?: () => void;
}

const WithPanel: FC<PropsWithChildren<WithPanelProps>> = ({
    children,
    value,
    renderAsPanel,
    onOpenStack,
    onCloseStack,
}) => {
    const { value: isPanelOpen, setTrue: showPanel, setFalse: hidePanel } = useBooleanState(false);
    useEffect(() => {
        if (isPanelOpen && renderAsPanel) {
            onOpenStack?.();
        } else {
            onCloseStack?.();
        }
    }, [isPanelOpen, onCloseStack, onOpenStack, renderAsPanel]);
    if (!renderAsPanel) {
        return <>{children}</>;
    }
    return (
        <>
            <div
                onClick={showPanel}
                className="group flex h-full min-h-8 w-full min-w-0 shrink cursor-pointer items-center"
            >
                <span className="inline-flex flex-1 shrink items-baseline justify-between gap-2 overflow-hidden">
                    <span className="group-hover:bg-tag-default-light dark:group-hover:bg-tag-default-dark -mx-0.5 min-w-0 shrink truncate whitespace-nowrap rounded px-0.5 font-mono text-xs">
                        {JSON.stringify(value)}
                    </span>
                </span>
            </div>
            <Transition
                as="div"
                show={isPanelOpen}
                appear={true}
                enter="ease-out transition-all duration-200"
                enterFrom="opacity-70 translate-x-full"
                enterTo="opacity-100 translate-x-0"
                leave="ease-in transition-all duration-200"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-70 translate-x-full"
                className="bg-background dark:bg-background-dark scroll-contain absolute inset-0 z-30 overflow-y-auto overflow-x-hidden"
            >
                <div className="bg-background dark:bg-background-dark border-border-default-light dark:border-border-default-dark sticky top-0 z-30 flex h-10 items-center border-b px-2">
                    <FernButton buttonStyle="minimal" icon={<ArrowLeftIcon />} text="Back" onClick={hidePanel} />
                </div>
                <div className="mx-auto my-10 flex w-full max-w-2xl flex-col gap-y-4 p-4 pb-10">{children}</div>
            </Transition>
        </>
    );
};

const createFilter = (onlyRequired: boolean, onlyOptional: boolean) => {
    if (onlyRequired && onlyOptional) {
        return () => true;
    }
    if (onlyRequired) {
        return (property: ResolvedObjectProperty) => property.valueShape.type !== "optional";
    }
    if (onlyOptional) {
        return (property: ResolvedObjectProperty) => property.valueShape.type === "optional";
    }
    return () => true;
};

export const PlaygroundTypeReferenceForm: FC<PlaygroundTypeReferenceFormProps> = ({
    shape,
    onChange,
    value,
    onBlur,
    onFocus,
    onOpenStack,
    onCloseStack,
    renderAsPanel = false,
    onlyRequired = false,
    onlyOptional = false,
    hideObjects = false,
    sortProperties = false,
}) => {
    return visitDiscriminatedUnion(shape, "type")._visit({
        object: (object) => (
            <WithPanel
                value={value}
                renderAsPanel={renderAsPanel}
                onOpenStack={onOpenStack}
                onCloseStack={onCloseStack}
            >
                <PlaygroundObjectPropertiesForm
                    properties={object.properties().filter(createFilter(onlyRequired, onlyOptional))}
                    onChange={onChange}
                    value={value}
                    hideObjects={hideObjects}
                    sortProperties={sortProperties}
                />
            </WithPanel>
        ),
        enum: ({ values }) => <PlaygroundEnumForm enumValues={values} onChange={onChange} value={value} />,
        undiscriminatedUnion: (undiscriminatedUnion) => (
            <WithPanel
                value={value}
                renderAsPanel={renderAsPanel}
                onOpenStack={onOpenStack}
                onCloseStack={onCloseStack}
            >
                <PlaygroundUniscriminatedUnionForm
                    undiscriminatedUnion={undiscriminatedUnion}
                    onChange={onChange}
                    value={value}
                />
            </WithPanel>
        ),
        discriminatedUnion: (discriminatedUnion) => (
            <WithPanel
                value={value}
                renderAsPanel={renderAsPanel}
                onOpenStack={onOpenStack}
                onCloseStack={onCloseStack}
            >
                <PlaygroundDiscriminatedUnionForm
                    discriminatedUnion={discriminatedUnion}
                    onChange={onChange}
                    value={value}
                />
            </WithPanel>
        ),
        string: () => (
            <FernInput
                className="w-full"
                value={typeof value === "string" ? value : ""}
                onValueChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
            />
        ),
        boolean: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <Switch
                    large={true}
                    checked={typeof value === "boolean" ? value : undefined}
                    onChange={(e) => onChange(e.target.checked)}
                    className="-mb-1 -mr-2"
                />
            </div>
        ),
        integer: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <FernNumericInput
                    className="w-full"
                    value={typeof value === "number" ? value : undefined}
                    onValueChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    disallowFloat={true}
                />
            </div>
        ),
        double: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <FernNumericInput
                    className="w-full"
                    value={typeof value === "number" ? value : undefined}
                    onValueChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </div>
        ),
        long: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <FernNumericInput
                    className="w-full"
                    value={typeof value === "number" ? value : undefined}
                    onValueChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    disallowFloat
                />
            </div>
        ),
        datetime: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <DateInput3
                    fill={true}
                    placeholder="MM/DD/YYYY"
                    timePrecision="millisecond"
                    value={typeof value === "string" ? value : undefined}
                    onChange={onChange}
                    inputProps={{
                        onFocus,
                        onBlur,
                    }}
                />
            </div>
        ),
        uuid: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <FernInput
                    className="w-full"
                    value={typeof value === "string" ? value : ""}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    onValueChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </div>
        ),
        base64: () => (
            <div className="flex min-w-0 flex-1 py-2">
                <FernTextarea
                    className="w-full"
                    value={typeof value === "string" ? value : ""}
                    onValueChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </div>
        ),
        date: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <DateInput3
                    fill={true}
                    placeholder="MM/DD/YYYY"
                    value={typeof value === "string" ? value : undefined}
                    onChange={onChange}
                    inputProps={{
                        onFocus,
                        onBlur,
                    }}
                />
            </div>
        ),
        optional: () => null, // should be handled by the parent
        list: (list) => <PlaygroundListForm itemShape={list.shape} onChange={onChange} value={value} />,
        set: (set) => <PlaygroundListForm itemShape={set.shape} onChange={onChange} value={value} />,
        map: (map) => (
            <PlaygroundMapForm keyShape={map.keyShape} valueShape={map.valueShape} onChange={onChange} value={value} />
        ),
        stringLiteral: (literal) => {
            onChange(literal.value);
            return (
                <div>
                    <span>{literal.value ? "TRUE" : "FALSE"}</span>
                </div>
            );
        },
        booleanLiteral: (literal) => {
            onChange(literal.value);
            return (
                <div>
                    <span>{literal.value}</span>
                </div>
            );
        },
        unknown: () => (
            <div className="flex min-w-0 flex-1 py-2">
                <FernTextarea
                    className="w-full"
                    value={typeof value === "string" ? value : ""}
                    onValueChange={onChange}
                />
            </div>
        ),
        _other: () => null,
        reference: (reference) => (
            <PlaygroundTypeReferenceForm
                shape={reference.shape()}
                onChange={onChange}
                value={value}
                onFocus={onFocus}
                onBlur={onBlur}
                onlyRequired={onlyRequired}
                onlyOptional={onlyOptional}
                hideObjects={hideObjects}
                sortProperties={sortProperties}
            />
        ),
    });
};
