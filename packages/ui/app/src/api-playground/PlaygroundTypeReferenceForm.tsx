import { ResolvedObjectProperty, ResolvedTypeReference } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { FC, PropsWithChildren, ReactElement, useCallback, useEffect } from "react";
import { FernButton } from "../components/FernButton";
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
}

interface WithPanelProps {
    value: unknown;
    renderAsPanel: boolean;
    onRemove: () => void;
    onOpenStack?: () => void;
    onCloseStack?: () => void;
    property?: ResolvedObjectProperty;
}

const WithPanel: FC<PropsWithChildren<WithPanelProps>> = ({
    children,
    value,
    renderAsPanel,
    onRemove,
    onOpenStack,
    onCloseStack,
    property,
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
            <div className={classNames({ hidden: isPanelOpen })}>
                <WithLabel property={property} value={value} onRemove={onRemove}>
                    <div
                        onClick={showPanel}
                        className="bg-tag-default-soft group relative -mx-4 min-h-10 cursor-pointer whitespace-pre-wrap break-all px-4 py-2 font-mono text-xs leading-tight"
                    >
                        {JSON.stringify(value, undefined, 1)}
                        <div className="t-muted absolute inset-y-0 right-2 flex items-center">
                            <ChevronDownIcon />
                        </div>
                    </div>
                </WithLabel>
            </div>
            <div
                className={classNames("-mx-4 p-4 border-default bg-background border-y shadow-md relative", {
                    hidden: !isPanelOpen,
                })}
            >
                <FernButton
                    variant="minimal"
                    icon={<ChevronUpIcon />}
                    onClick={hidePanel}
                    className="absolute right-1 top-1"
                    rounded
                />
                <div className="mb-4">
                    <h6 className="m-0 font-mono">{property?.key}</h6>
                </div>
                {children}
            </div>
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
}) => {
    const onRemove = useCallback(() => {
        onChange(undefined);
    }, [onChange]);
    return visitDiscriminatedUnion(shape, "type")._visit<ReactElement | null>({
        object: (object) => (
            <WithPanel
                value={value}
                renderAsPanel={renderAsPanel}
                onRemove={onRemove}
                onOpenStack={onOpenStack}
                onCloseStack={onCloseStack}
                property={property}
            >
                <PlaygroundObjectPropertiesForm
                    properties={object.properties().filter(createFilter(onlyRequired, onlyOptional))}
                    onChange={onChange}
                    value={value}
                />
            </WithPanel>
        ),
        enum: ({ values }) => (
            <WithLabel property={property} value={value} onRemove={onRemove}>
                <PlaygroundEnumForm enumValues={values} onChange={onChange} value={value} />
            </WithLabel>
        ),
        undiscriminatedUnion: (undiscriminatedUnion) => (
            <WithPanel
                value={value}
                renderAsPanel={renderAsPanel}
                onRemove={onRemove}
                onOpenStack={onOpenStack}
                onCloseStack={onCloseStack}
                property={property}
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
                onRemove={onRemove}
                onOpenStack={onOpenStack}
                onCloseStack={onCloseStack}
                property={property}
            >
                <PlaygroundDiscriminatedUnionForm
                    discriminatedUnion={discriminatedUnion}
                    onChange={onChange}
                    value={value}
                />
            </WithPanel>
        ),
        string: () => (
            <WithLabel property={property} value={value} onRemove={onRemove}>
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
                <WithLabel property={property} value={value} onRemove={onRemove}>
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
            <WithLabel property={property} value={value} onRemove={onRemove}>
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
            <WithLabel property={property} value={value} onRemove={onRemove}>
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
            <WithLabel property={property} value={value} onRemove={onRemove}>
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
            <WithLabel property={property} value={value} onRemove={onRemove}>
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
            <WithLabel property={property} value={value} onRemove={onRemove}>
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
            <WithLabel property={property} value={value} onRemove={onRemove}>
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
            <WithLabel property={property} value={value} onRemove={onRemove}>
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
            <WithLabel property={property} value={value} onRemove={onRemove}>
                <PlaygroundListForm itemShape={list.shape} onChange={onChange} value={value} />
            </WithLabel>
        ),
        set: (set) => (
            <WithLabel property={property} value={value} onRemove={onRemove}>
                <PlaygroundListForm itemShape={set.shape} onChange={onChange} value={value} />
            </WithLabel>
        ),
        map: (map) => (
            <WithLabel property={property} value={value} onRemove={onRemove}>
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
                <WithLabel property={property} value={value} onRemove={onRemove}>
                    <span>{literal.value ? "TRUE" : "FALSE"}</span>
                </WithLabel>
            );
        },
        booleanLiteral: (literal) => {
            onChange(literal.value);
            return (
                <WithLabel property={property} value={value} onRemove={onRemove}>
                    <span>{literal.value}</span>
                </WithLabel>
            );
        },
        unknown: () => (
            <WithLabel property={property} value={value} onRemove={onRemove}>
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
            />
        ),
    });
};
