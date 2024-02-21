import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { FC, ReactElement, useCallback } from "react";
import { FernInput } from "../components/FernInput";
import { FernNumericInput } from "../components/FernNumericInput";
import { FernSwitch } from "../components/FernSwitch";
import { FernTextarea } from "../components/FernTextarea";
import { ResolvedObjectProperty, ResolvedTypeReference } from "../util/resolver";
import { PlaygroundDiscriminatedUnionForm } from "./PlaygroundDescriminatedUnionForm";
import { PlaygroundEnumForm } from "./PlaygroundEnumForm";
import { PlaygroundListForm } from "./PlaygroundListForm";
import { PlaygroundMapForm } from "./PlaygroundMapForm";
import { PlaygroundObjectPropertiesForm } from "./PlaygroundObjectPropertyForm";
import { PlaygroundUniscriminatedUnionForm } from "./PlaygroundUniscriminatedUnionForm";
import { WithLabel } from "./WithLabel";

interface PlaygroundTypeReferenceFormProps {
    id: string;
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

// interface WithPanelProps {
//     value: unknown;
//     renderAsPanel: boolean;
//     onRemove: () => void;
//     onOpenStack?: () => void;
//     onCloseStack?: () => void;
//     property?: ResolvedObjectProperty;
// }

// const WithPanel: FC<PropsWithChildren<WithPanelProps>> = ({
//     children,
//     value,
//     renderAsPanel,
//     onRemove,
//     onOpenStack,
//     onCloseStack,
//     property,
// }) => {
//     const { value: isPanelOpen, setTrue: showPanel, setFalse: hidePanel } = useBooleanState(false);
//     useEffect(() => {
//         if (isPanelOpen && renderAsPanel) {
//             onOpenStack?.();
//         } else {
//             onCloseStack?.();
//         }
//     }, [isPanelOpen, onCloseStack, onOpenStack, renderAsPanel]);
//     if (!renderAsPanel) {
//         return <>{children}</>;
//     }
//     return (
//         <>
//             <div className={classNames({ hidden: isPanelOpen })}>
//                 <WithLabel property={property} value={value} onRemove={onRemove}>
//                     <div
//                         onClick={showPanel}
//                         className="bg-tag-default-soft group relative -mx-4 min-h-10 cursor-pointer whitespace-pre-wrap break-all p-1 font-mono text-xs leading-tight"
//                     >
//                         <FernSyntaxHighlighter language="json" customStyle={{ fontSize: "12px", lineHeight: "20px" }}>
//                             {JSON.stringify(value, undefined, 2)}
//                         </FernSyntaxHighlighter>
//                         <div className="t-muted absolute inset-y-0 right-2 flex items-center">
//                             <ChevronDownIcon />
//                         </div>
//                     </div>
//                 </WithLabel>
//             </div>
//             <div
//                 className={classNames("-mx-4 p-4 border-default bg-background border-y shadow-md relative", {
//                     hidden: !isPanelOpen,
//                 })}
//             >
//                 <FernButton
//                     variant="minimal"
//                     icon={<ChevronUpIcon />}
//                     onClick={hidePanel}
//                     className="absolute right-1 top-1"
//                     rounded
//                 />
//                 <div className="mb-4">
//                     <h6 className="m-0 font-mono">{property?.key}</h6>
//                 </div>
//                 {children}
//             </div>
//         </>
//     );
// };

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
    id,
    property,
    shape,
    onChange,
    value,
    onBlur,
    onFocus,
    // onOpenStack,
    // onCloseStack,
    // renderAsPanel = false,
    onlyRequired = false,
    onlyOptional = false,
}) => {
    const onRemove = useCallback(() => {
        onChange(undefined);
    }, [onChange]);
    return visitDiscriminatedUnion(shape, "type")._visit<ReactElement | null>({
        object: (object) => (
            <WithLabel property={property} value={value} onRemove={onRemove}>
                <PlaygroundObjectPropertiesForm
                    properties={object.properties().filter(createFilter(onlyRequired, onlyOptional))}
                    onChange={onChange}
                    value={value}
                    indent={true}
                    id={id}
                />
            </WithLabel>
        ),
        enum: ({ values }) => (
            <WithLabel property={property} value={value} onRemove={onRemove}>
                <PlaygroundEnumForm enumValues={values} onChange={onChange} value={value} id={id} />
            </WithLabel>
        ),
        undiscriminatedUnion: (undiscriminatedUnion) => (
            <WithLabel property={property} value={value} onRemove={onRemove}>
                <PlaygroundUniscriminatedUnionForm
                    undiscriminatedUnion={undiscriminatedUnion}
                    onChange={onChange}
                    value={value}
                    id={id}
                />
            </WithLabel>
        ),
        discriminatedUnion: (discriminatedUnion) => (
            <WithLabel property={property} value={value} onRemove={onRemove}>
                <PlaygroundDiscriminatedUnionForm
                    discriminatedUnion={discriminatedUnion}
                    onChange={onChange}
                    value={value}
                    id={id}
                />
            </WithLabel>
        ),
        string: () => (
            <WithLabel property={property} value={value} onRemove={onRemove} htmlFor={id}>
                <FernInput
                    id={id}
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
                <WithLabel property={property} value={value} onRemove={onRemove} htmlFor={id}>
                    <div className="flex items-center justify-start gap-3">
                        {/* <label className="t-muted font-mono text-sm leading-none">
                        {checked == null ? "undefined" : checked ? "true" : "false"}
                    </label> */}
                        <FernSwitch checked={checked} onCheckedChange={onChange} id={id} />
                    </div>
                </WithLabel>
            );
        },
        integer: () => (
            <WithLabel property={property} value={value} onRemove={onRemove} htmlFor={id}>
                <FernNumericInput
                    id={id}
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
            <WithLabel property={property} value={value} onRemove={onRemove} htmlFor={id}>
                <FernNumericInput
                    id={id}
                    className="w-full"
                    value={typeof value === "number" ? value : undefined}
                    onValueChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </WithLabel>
        ),
        long: () => (
            <WithLabel property={property} value={value} onRemove={onRemove} htmlFor={id}>
                <FernNumericInput
                    id={id}
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
            <WithLabel property={property} value={value} onRemove={onRemove} htmlFor={id}>
                <FernInput
                    id={id}
                    type="datetime-local"
                    className="w-full"
                    placeholder="MM/DD/YYYY HH:MM"
                    value={typeof value === "string" ? value : undefined}
                    onValueChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </WithLabel>
        ),
        uuid: () => (
            <WithLabel property={property} value={value} onRemove={onRemove} htmlFor={id}>
                <FernInput
                    id={id}
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
            <WithLabel property={property} value={value} onRemove={onRemove} htmlFor={id}>
                <FernTextarea
                    id={id}
                    className="w-full"
                    value={typeof value === "string" ? value : ""}
                    onValueChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </WithLabel>
        ),
        date: () => (
            <WithLabel property={property} value={value} onRemove={onRemove} htmlFor={id}>
                <FernInput
                    id={id}
                    type="date"
                    className="w-full"
                    placeholder="MM/DD/YYYY"
                    value={typeof value === "string" ? value : undefined}
                    onValueChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </WithLabel>
        ),
        optional: () => null, // should be handled by the parent
        list: (list) => (
            <WithLabel property={property} value={value} onRemove={onRemove} htmlFor={id}>
                <PlaygroundListForm itemShape={list.shape} onChange={onChange} value={value} id={id} />
            </WithLabel>
        ),
        set: (set) => (
            <WithLabel property={property} value={value} onRemove={onRemove} htmlFor={id}>
                <PlaygroundListForm itemShape={set.shape} onChange={onChange} value={value} id={id} />
            </WithLabel>
        ),
        map: (map) => (
            <WithLabel property={property} value={value} onRemove={onRemove} htmlFor={id}>
                <PlaygroundMapForm
                    id={id}
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
                <WithLabel property={property} value={value} onRemove={onRemove} htmlFor={id}>
                    <span>{literal.value ? "TRUE" : "FALSE"}</span>
                </WithLabel>
            );
        },
        booleanLiteral: (literal) => {
            onChange(literal.value);
            return (
                <WithLabel property={property} value={value} onRemove={onRemove} htmlFor={id}>
                    <span>{literal.value}</span>
                </WithLabel>
            );
        },
        unknown: () => (
            <WithLabel property={property} value={value} onRemove={onRemove} htmlFor={id}>
                <FernTextarea
                    id={id}
                    className="w-full"
                    value={typeof value === "string" ? value : ""}
                    onValueChange={onChange}
                />
            </WithLabel>
        ),
        _other: () => null,
        reference: (reference) => (
            <PlaygroundTypeReferenceForm
                id={id}
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
