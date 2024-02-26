import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useSetAtom } from "jotai";
import { FC, ReactElement, useCallback } from "react";
import { FernInput } from "../components/FernInput";
import { FernNumericInput } from "../components/FernNumericInput";
import { FernSwitch } from "../components/FernSwitch";
import { FernTextarea } from "../components/FernTextarea";
import {
    dereferenceObjectProperties,
    ResolvedObjectProperty,
    ResolvedTypeDefinition,
    ResolvedTypeShape,
    unwrapReference,
} from "../util/resolver";
import { PlaygroundDiscriminatedUnionForm } from "./PlaygroundDescriminatedUnionForm";
import { FOCUSED_PARAMETER_ATOM } from "./PlaygroundEndpointFormAside";
import { PlaygroundEnumForm } from "./PlaygroundEnumForm";
import { PlaygroundListForm } from "./PlaygroundListForm";
import { PlaygroundMapForm } from "./PlaygroundMapForm";
import { PlaygroundObjectPropertiesForm } from "./PlaygroundObjectPropertyForm";
import { PlaygroundUniscriminatedUnionForm } from "./PlaygroundUniscriminatedUnionForm";
import { WithLabel } from "./WithLabel";

interface PlaygroundTypeReferenceFormProps {
    id: string;
    property?: ResolvedObjectProperty;
    shape: ResolvedTypeShape;
    onChange: (value: unknown) => void;
    value?: unknown;
    // onFocus?: () => void;
    // onBlur?: () => void;
    onOpenStack?: () => void;
    onCloseStack?: () => void;
    renderAsPanel?: boolean;
    onlyRequired?: boolean;
    onlyOptional?: boolean;
    types: Record<string, ResolvedTypeDefinition>;
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

export const PlaygroundTypeReferenceForm: FC<PlaygroundTypeReferenceFormProps> = ({
    id,
    property,
    shape,
    onChange,
    value,
    types,
}) => {
    const setFocusedParameter = useSetAtom(FOCUSED_PARAMETER_ATOM);
    const onRemove = useCallback(() => {
        onChange(undefined);
    }, [onChange]);
    return visitDiscriminatedUnion(unwrapReference(shape, types), "type")._visit<ReactElement | null>({
        object: (object) => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types}>
                <PlaygroundObjectPropertiesForm
                    properties={dereferenceObjectProperties(object, types)}
                    onChange={onChange}
                    value={value}
                    indent={true}
                    id={id}
                    types={types}
                />
            </WithLabel>
        ),
        enum: ({ values }) => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types}>
                <PlaygroundEnumForm
                    enumValues={values}
                    onChange={onChange}
                    value={value}
                    id={id}
                    onFocus={() => {
                        setFocusedParameter(id);
                    }}
                />
            </WithLabel>
        ),
        undiscriminatedUnion: (undiscriminatedUnion) => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types}>
                <PlaygroundUniscriminatedUnionForm
                    undiscriminatedUnion={undiscriminatedUnion}
                    onChange={onChange}
                    value={value}
                    id={id}
                    types={types}
                />
            </WithLabel>
        ),
        discriminatedUnion: (discriminatedUnion) => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types}>
                <PlaygroundDiscriminatedUnionForm
                    discriminatedUnion={discriminatedUnion}
                    onChange={onChange}
                    value={value}
                    id={id}
                    types={types}
                />
            </WithLabel>
        ),
        string: () => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                <FernInput
                    id={id}
                    className="w-full"
                    value={typeof value === "string" ? value : ""}
                    onValueChange={onChange}
                    onFocus={() => {
                        setFocusedParameter(id);
                    }}
                />
            </WithLabel>
        ),
        boolean: () => {
            const checked = typeof value === "boolean" ? value : undefined;
            return (
                <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
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
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                <FernNumericInput
                    id={id}
                    className="w-full"
                    value={typeof value === "number" ? value : undefined}
                    onValueChange={onChange}
                    onFocus={() => {
                        setFocusedParameter(id);
                    }}
                    disallowFloat={true}
                />
            </WithLabel>
        ),
        double: () => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                <FernNumericInput
                    id={id}
                    className="w-full"
                    value={typeof value === "number" ? value : undefined}
                    onValueChange={onChange}
                    onFocus={() => {
                        setFocusedParameter(id);
                    }}
                />
            </WithLabel>
        ),
        long: () => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                <FernNumericInput
                    id={id}
                    className="w-full"
                    value={typeof value === "number" ? value : undefined}
                    onValueChange={onChange}
                    onFocus={() => {
                        setFocusedParameter(id);
                    }}
                    disallowFloat={true}
                />
            </WithLabel>
        ),
        datetime: () => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                <FernInput
                    id={id}
                    type="datetime-local"
                    className="w-full"
                    placeholder="MM/DD/YYYY HH:MM"
                    value={typeof value === "string" ? value : undefined}
                    onValueChange={onChange}
                    onFocus={() => {
                        setFocusedParameter(id);
                    }}
                />
            </WithLabel>
        ),
        uuid: () => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                <FernInput
                    id={id}
                    className="w-full"
                    value={typeof value === "string" ? value : ""}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    onValueChange={onChange}
                    onFocus={() => {
                        setFocusedParameter(id);
                    }}
                />
            </WithLabel>
        ),
        base64: () => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                <FernTextarea
                    id={id}
                    className="w-full"
                    value={typeof value === "string" ? value : ""}
                    onValueChange={onChange}
                    onFocus={() => {
                        setFocusedParameter(id);
                    }}
                />
            </WithLabel>
        ),
        date: () => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                <FernInput
                    id={id}
                    type="date"
                    className="w-full"
                    placeholder="MM/DD/YYYY"
                    value={typeof value === "string" ? value : undefined}
                    onValueChange={onChange}
                    onFocus={() => {
                        setFocusedParameter(id);
                    }}
                />
            </WithLabel>
        ),
        optional: () => null, // should be handled by the parent
        list: (list) => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                <PlaygroundListForm itemShape={list.shape} onChange={onChange} value={value} id={id} types={types} />
            </WithLabel>
        ),
        set: (set) => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                <PlaygroundListForm itemShape={set.shape} onChange={onChange} value={value} id={id} types={types} />
            </WithLabel>
        ),
        map: (map) => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                <PlaygroundMapForm
                    id={id}
                    keyShape={map.keyShape}
                    valueShape={map.valueShape}
                    onChange={onChange}
                    value={value}
                    types={types}
                />
            </WithLabel>
        ),
        stringLiteral: (literal) => {
            onChange(literal.value);
            return (
                <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                    <span>{literal.value ? "TRUE" : "FALSE"}</span>
                </WithLabel>
            );
        },
        booleanLiteral: (literal) => {
            onChange(literal.value);
            return (
                <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                    <span>{literal.value}</span>
                </WithLabel>
            );
        },
        unknown: () => (
            <WithLabel property={property} value={value} onRemove={onRemove} types={types} htmlFor={id}>
                <FernTextarea
                    id={id}
                    className="w-full"
                    value={typeof value === "string" ? value : ""}
                    onValueChange={onChange}
                />
            </WithLabel>
        ),
        _other: () => null,
        alias: (alias) => (
            <PlaygroundTypeReferenceForm
                id={id}
                property={property}
                shape={alias.shape}
                onChange={onChange}
                value={value}
                types={types}
            />
        ),
    });
};
