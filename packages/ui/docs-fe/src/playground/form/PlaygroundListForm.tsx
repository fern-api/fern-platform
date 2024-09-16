import { FernButton } from "@fern-ui/components";
import clsx from "clsx";
import { Plus, Xmark } from "iconoir-react";
import { memo, useCallback } from "react";
import { ResolvedTypeDefinition, ResolvedTypeShape } from "../../resolver/types";
import { getDefaultValueForType, shouldRenderInline } from "../utils";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";

interface PlaygroundListFormProps {
    itemShape: ResolvedTypeShape;
    onChange: (value: unknown) => void;
    value: unknown;
    id: string;
    types: Record<string, ResolvedTypeDefinition>;
}

export const PlaygroundListForm = memo<PlaygroundListFormProps>(({ itemShape, onChange, value, id, types }) => {
    const appendItem = useCallback(() => {
        onChange((oldValue: unknown) => {
            const oldArray = Array.isArray(oldValue) ? oldValue : [];
            return [...oldArray, getDefaultValueForType(itemShape, types)];
        });
    }, [itemShape, onChange, types]);
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

    const renderInline = shouldRenderInline(itemShape, types);
    return (
        <>
            {valueAsList.length > 0 && (
                <ul className="border-default divide-default w-full max-w-full list-none divide-y divide-dashed border-t border-dashed">
                    {valueAsList.map((item, idx) => (
                        <li
                            key={idx}
                            className={clsx("min-h-12 w-full space-y-2", {
                                "py-2": renderInline,
                                "pb-4 pt-2": !renderInline,
                            })}
                        >
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
                                        id={`${id}[${idx}]`}
                                        types={types}
                                    />
                                )}

                                <FernButton
                                    icon={<Xmark />}
                                    onClick={() => handleRemoveItem(idx)}
                                    variant="minimal"
                                    size="small"
                                    className="-ml-1 -mr-3 opacity-50 transition-opacity hover:opacity-100"
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
                                    id={`${id}[${idx}]`}
                                    types={types}
                                />
                            )}
                        </li>
                    ))}
                    <li className="pt-2">
                        <FernButton
                            icon={<Plus />}
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
                    icon={<Plus />}
                    text="Add new item"
                    className="w-full"
                    onClick={appendItem}
                    variant="outlined"
                />
            )}
        </>
    );
});

PlaygroundListForm.displayName = "PlaygroundListForm";
