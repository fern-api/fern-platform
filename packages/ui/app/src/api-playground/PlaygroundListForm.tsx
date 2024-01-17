import { Button } from "@blueprintjs/core";
import { Cross, Plus } from "@blueprintjs/icons";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { FC, useCallback } from "react";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { getDefaultValueForType } from "./utils";

interface PlaygroundListFormProps {
    itemType: APIV1Read.TypeReference;
    onChange: (value: unknown) => void;
    value: unknown;
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined;
}

export const PlaygroundListForm: FC<PlaygroundListFormProps> = ({ itemType, onChange, value, resolveTypeById }) => {
    const appendItem = useCallback(() => {
        onChange((oldValue: unknown) => {
            const oldArray = Array.isArray(oldValue) ? oldValue : [];
            return [...oldArray, getDefaultValueForType(itemType, resolveTypeById)];
        });
    }, [itemType, onChange, resolveTypeById]);
    const valueAsList = Array.isArray(value) ? value : [];
    const handleChangeItem = useCallback(
        (idx: number, newValue: unknown) => {
            onChange((oldValue: unknown) => {
                const oldArray = Array.isArray(oldValue) ? oldValue : [];
                return [...oldArray.slice(0, idx), newValue, ...oldArray.slice(idx + 1)];
            });
        },
        [onChange]
    );
    const handleRemoveItem = useCallback(
        (idx: number) => {
            onChange((oldValue: unknown) => {
                const oldArray = Array.isArray(oldValue) ? oldValue : [];
                return [...oldArray.slice(0, idx), ...oldArray.slice(idx + 1)];
            });
        },
        [onChange]
    );
    return (
        <>
            {valueAsList.length > 0 && (
                <ul className="divide-border-default-dark dark:divide-border-default-dark border-border-default-light dark:border-border-default-dark max-w-full list-none divide-y divide-dashed border-t border-dashed">
                    {valueAsList.map((item, idx) => (
                        <li key={idx} className="flex min-h-12 flex-row items-center gap-1 py-2">
                            <div className="flex min-w-0 shrink items-center justify-between gap-2">
                                <label className="inline-flex flex-wrap items-baseline">
                                    <span className="t-muted bg-tag-default-light dark:bg-tag-default-dark rounded p-1 text-xs uppercase">
                                        {idx + 1}
                                    </span>
                                </label>
                            </div>

                            <div className="flex min-w-0 flex-1 shrink items-center gap-2">
                                <PlaygroundTypeReferenceForm
                                    typeReference={itemType}
                                    value={item}
                                    onChange={(newItem) =>
                                        handleChangeItem(idx, typeof newItem === "function" ? newItem(item) : newItem)
                                    }
                                    renderAsPanel={true}
                                    resolveTypeById={resolveTypeById}
                                />
                                <Button
                                    icon={<Cross />}
                                    onClick={() => handleRemoveItem(idx)}
                                    minimal={true}
                                    small={true}
                                    className="-mx-1"
                                />
                            </div>
                        </li>
                    ))}
                    <li className="py-2">
                        <Button icon={<Plus />} text="Add new item" onClick={appendItem} outlined={true} fill={true} />
                    </li>
                </ul>
            )}
            {valueAsList.length === 0 && (
                <Button icon={<Plus />} text="Add new item" onClick={appendItem} outlined={true} fill={true} />
            )}
        </>
    );
};
