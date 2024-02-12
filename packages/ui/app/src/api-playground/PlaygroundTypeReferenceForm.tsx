import { ResolvedObjectProperty, ResolvedTypeReference } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { ArrowRightIcon, Cross1Icon } from "@radix-ui/react-icons";
import { FC, PropsWithChildren, ReactElement, useEffect } from "react";
import { FernButton } from "../components/FernButton";
import { FernCollapse } from "../components/FernCollapse";
import { FernInput } from "../components/FernInput";
import { FernNumericInput } from "../components/FernNumericInput";
import { FernSwitch } from "../components/FernSwitch";
import { FernTextarea } from "../components/FernTextarea";
import { PlaygroundDiscriminatedUnionForm } from "./PlaygroundDescriminatedUnionForm";
import { PlaygroundEnumForm } from "./PlaygroundEnumForm";
import { PlaygroundListForm } from "./PlaygroundListForm";
import { PlaygroundMapForm } from "./PlaygroundMapForm";
import { PlaygroundObjectPropertiesForm } from "./PlaygroundObjectPropertyForm";
import { PlaygroundUniscriminatedUnionForm } from "./PlaygroundUniscriminatedUnionForm";
import { WithLabel } from "./WithLabel";

interface PlaygroundTypeReferenceFormProps {
    property?: ResolvedObjectProperty;
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
        <div className="-mx-4 flex-1">
            <FernCollapse isOpen={!isPanelOpen}>
                <div className="px-4">
                    <div
                        onClick={showPanel}
                        className="bg-tag-default ring-default group relative min-h-10 w-full cursor-pointer whitespace-pre-wrap break-all rounded p-1 font-mono text-xs leading-tight hover:ring-1"
                    >
                        {JSON.stringify(value, undefined, 1)}
                        <div className="t-muted absolute inset-y-0 right-2 flex items-center">
                            <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </div>
            </FernCollapse>
            <FernCollapse isOpen={isPanelOpen} className="-mx-2">
                <div className="-mt-8 flex w-full justify-center">
                    <FernButton variant="outlined" icon={<Cross1Icon />} onClick={hidePanel} className="mb-2" rounded />
                </div>
                <div className="border-default bg-background rounded-xl border shadow-md">{children}</div>
            </FernCollapse>
        </div>
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
    property,
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
    return visitDiscriminatedUnion(shape, "type")._visit<ReactElement | null>({
        object: (object) => (
            <WithPanel
                value={value}
                renderAsPanel={renderAsPanel}
                onOpenStack={onOpenStack}
                onCloseStack={onCloseStack}
            >
                <WithLabel property={property} value={value}>
                    <PlaygroundObjectPropertiesForm
                        properties={object.properties().filter(createFilter(onlyRequired, onlyOptional))}
                        onChange={onChange}
                        value={value}
                        hideObjects={hideObjects}
                        sortProperties={sortProperties}
                    />
                </WithLabel>
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
                <WithLabel property={property} value={value}>
                    <PlaygroundUniscriminatedUnionForm
                        undiscriminatedUnion={undiscriminatedUnion}
                        onChange={onChange}
                        value={value}
                    />
                </WithLabel>
            </WithPanel>
        ),
        discriminatedUnion: (discriminatedUnion) => (
            <WithPanel
                value={value}
                renderAsPanel={renderAsPanel}
                onOpenStack={onOpenStack}
                onCloseStack={onCloseStack}
            >
                <WithLabel property={property} value={value}>
                    <PlaygroundDiscriminatedUnionForm
                        discriminatedUnion={discriminatedUnion}
                        onChange={onChange}
                        value={value}
                    />
                </WithLabel>
            </WithPanel>
        ),
        string: () => (
            <WithLabel property={property} value={value}>
                <FernInput
                    className="w-full"
                    value={typeof value === "string" ? value : ""}
                    onValueChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </WithLabel>
        ),
        boolean: () => {
            const checked = typeof value === "boolean" ? value : undefined;
            return (
                <WithLabel property={property} value={value}>
                    <div className="flex items-center justify-end gap-3">
                        {/* <label className="t-muted font-mono text-sm leading-none">
                        {checked == null ? "undefined" : checked ? "true" : "false"}
                    </label> */}
                        <FernSwitch checked={checked} onCheckedChange={onChange} />
                    </div>
                </WithLabel>
            );
        },
        integer: () => (
            <WithLabel property={property} value={value}>
                <FernNumericInput
                    className="w-full"
                    value={typeof value === "number" ? value : undefined}
                    onValueChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    disallowFloat={true}
                />
            </WithLabel>
        ),
        double: () => (
            <WithLabel property={property} value={value}>
                <FernNumericInput
                    className="w-full"
                    value={typeof value === "number" ? value : undefined}
                    onValueChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </WithLabel>
        ),
        long: () => (
            <WithLabel property={property} value={value}>
                <FernNumericInput
                    className="w-full"
                    value={typeof value === "number" ? value : undefined}
                    onValueChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    disallowFloat
                />
            </WithLabel>
        ),
        datetime: () => (
            <WithLabel property={property} value={value}>
                <FernInput
                    type="datetime-local"
                    className="w-full"
                    placeholder="MM/DD/YYYY HH:MM"
                    value={typeof value === "string" ? value : undefined}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </WithLabel>
        ),
        uuid: () => (
            <WithLabel property={property} value={value}>
                <FernInput
                    className="w-full"
                    value={typeof value === "string" ? value : ""}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    onValueChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </WithLabel>
        ),
        base64: () => (
            <WithLabel property={property} value={value}>
                <FernTextarea
                    className="w-full"
                    value={typeof value === "string" ? value : ""}
                    onValueChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </WithLabel>
        ),
        date: () => (
            <WithLabel property={property} value={value}>
                <FernInput
                    type="date"
                    className="w-full"
                    placeholder="MM/DD/YYYY"
                    value={typeof value === "string" ? value : undefined}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </WithLabel>
        ),
        optional: () => null, // should be handled by the parent
        list: (list) => (
            <WithLabel property={property} value={value}>
                <PlaygroundListForm itemShape={list.shape} onChange={onChange} value={value} />
            </WithLabel>
        ),
        set: (set) => (
            <WithLabel property={property} value={value}>
                <PlaygroundListForm itemShape={set.shape} onChange={onChange} value={value} />
            </WithLabel>
        ),
        map: (map) => (
            <WithLabel property={property} value={value}>
                <PlaygroundMapForm
                    keyShape={map.keyShape}
                    valueShape={map.valueShape}
                    onChange={onChange}
                    value={value}
                />
            </WithLabel>
        ),
        stringLiteral: (literal) => {
            onChange(literal.value);
            return (
                <WithLabel property={property} value={value}>
                    <span>{literal.value ? "TRUE" : "FALSE"}</span>
                </WithLabel>
            );
        },
        booleanLiteral: (literal) => {
            onChange(literal.value);
            return (
                <WithLabel property={property} value={value}>
                    <span>{literal.value}</span>
                </WithLabel>
            );
        },
        unknown: () => (
            <WithLabel property={property} value={value}>
                <FernTextarea
                    className="w-full"
                    value={typeof value === "string" ? value : ""}
                    onValueChange={onChange}
                />
            </WithLabel>
        ),
        _other: () => null,
        reference: (reference) => (
            <PlaygroundTypeReferenceForm
                property={property}
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
