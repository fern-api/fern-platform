import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { Cross1Icon, PlusIcon } from "@radix-ui/react-icons";
import { FC, useCallback } from "react";
import { FernButton } from "../components/FernButton";
import { ResolvedTypeReference, unwrapReference } from "../util/resolver";
import { ENUM_RADIO_BREAKPOINT } from "./PlaygroundEnumForm";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { getDefaultValueForType } from "./utils";

interface PlaygroundListFormProps {
    itemShape: ResolvedTypeReference;
    onChange: (value: unknown) => void;
    value: unknown;
}

export const PlaygroundListForm: FC<PlaygroundListFormProps> = ({ itemShape, onChange, value }) => {
    const appendItem = useCallback(() => {
        onChange((oldValue: unknown) => {
            const oldArray = Array.isArray(oldValue) ? oldValue : [];
            return [...oldArray, getDefaultValueForType(itemShape)];
        });
    }, [itemShape, onChange]);
    const valueAsList = Array.isArray(value) ? value : [];
    const handleChangeItem = useCallback(
        (idx: number, newValue: unknown) => {
            onChange((oldValue: unknown) => {
                const oldArray = Array.isArray(oldValue) ? oldValue : [];
                return [...oldArray.slice(0, idx), newValue, ...oldArray.slice(idx + 1)];
            });
        },
        [onChange],
    );
    const handleRemoveItem = useCallback(
        (idx: number) => {
            onChange((oldValue: unknown) => {
                const oldArray = Array.isArray(oldValue) ? oldValue : [];
                return [...oldArray.slice(0, idx), ...oldArray.slice(idx + 1)];
            });
        },
        [onChange],
    );

    const renderInline = shouldRenderInline(itemShape);
    return (
        <>
            {valueAsList.length > 0 && (
                <ul className="divide-border-default border-default w-full max-w-full list-none divide-y divide-dashed border-t border-dashed">
                    {valueAsList.map((item, idx) => (
                        <li key={idx} className="min-h-12 w-full space-y-2 py-2">
                            <div className="flex min-w-0 shrink items-center justify-between gap-2">
                                <label className="inline-flex flex-wrap items-baseline">
                                    <span className="t-muted bg-tag-default min-w-6 rounded-xl p-1 text-center text-xs font-semibold uppercase">
                                        {idx + 1}
                                    </span>
                                </label>

                                {renderInline && (
                                    <PlaygroundTypeReferenceForm
                                        shape={itemShape}
                                        value={item}
                                        onChange={(newItem) =>
                                            handleChangeItem(
                                                idx,
                                                typeof newItem === "function" ? newItem(item) : newItem,
                                            )
                                        }
                                        renderAsPanel={true}
                                    />
                                )}

                                <FernButton
                                    icon={<Cross1Icon />}
                                    onClick={() => handleRemoveItem(idx)}
                                    variant="minimal"
                                    size="small"
                                    className="-mx-1"
                                />
                            </div>

                            {!renderInline && (
                                <PlaygroundTypeReferenceForm
                                    shape={itemShape}
                                    value={item}
                                    onChange={(newItem) =>
                                        handleChangeItem(idx, typeof newItem === "function" ? newItem(item) : newItem)
                                    }
                                    renderAsPanel={true}
                                />
                            )}
                        </li>
                    ))}
                    <li className="py-2">
                        <FernButton
                            icon={<PlusIcon />}
                            text="Add new item"
                            onClick={appendItem}
                            variant="outlined"
                            className="w-full"
                        />
                    </li>
                </ul>
            )}
            {valueAsList.length === 0 && (
                <FernButton
                    icon={<PlusIcon />}
                    text="Add new item"
                    className="w-full"
                    onClick={appendItem}
                    variant="outlined"
                />
            )}
        </>
    );
};

function shouldRenderInline(typeReference: ResolvedTypeReference): boolean {
    return visitDiscriminatedUnion(unwrapReference(typeReference), "type")._visit({
        string: () => true,
        boolean: () => true,
        object: () => false,
        map: () => false,
        undiscriminatedUnion: () => false,
        discriminatedUnion: () => false,
        enum: (_enum) => _enum.values.length >= ENUM_RADIO_BREAKPOINT,
        integer: () => true,
        double: () => true,
        long: () => true,
        datetime: () => true,
        uuid: () => true,
        base64: () => true,
        date: () => true,
        optional: () => false,
        list: () => false,
        set: () => false,
        booleanLiteral: () => true,
        stringLiteral: () => true,
        unknown: () => false,
        _other: () => false,
    });
}
