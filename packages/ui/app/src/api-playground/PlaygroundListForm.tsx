import { Button } from "@blueprintjs/core";
import { Cross, Plus } from "@blueprintjs/icons";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { FC, useCallback, useEffect } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { getDefaultValueForType } from "./utils";

interface PlaygroundListFormProps {
    itemType: APIV1Read.TypeReference;
    onChange: (value: unknown) => void;
    value: unknown;
}

export const PlaygroundListForm: FC<PlaygroundListFormProps> = ({ itemType, onChange, value }) => {
    const { resolveTypeById } = useApiDefinitionContext();
    useEffect(() => {
        if (!Array.isArray(value) && value != null) {
            onChange([]);
        }
    }, [onChange, value]);
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
        <div className="w-full">
            {valueAsList.length > 0 && (
                <ul className="border-border-default-light dark:border-border-default-dark w-full list-none space-y-4 border-l pl-4">
                    {valueAsList.map((item, idx) => (
                        <li key={idx}>
                            <div className="flex items-center justify-between gap-2">
                                <label className="inline-flex flex-wrap items-baseline">
                                    <span className="t-muted text-xs uppercase">{`Item ${idx + 1}`}</span>
                                </label>

                                <div className="flex flex-1 items-center gap-2">
                                    <div className="bg-border-default-light dark:bg-border-default-dark h-px w-full" />
                                    <Button
                                        icon={<Cross />}
                                        onClick={() => handleRemoveItem(idx)}
                                        minimal={true}
                                        small={true}
                                        className="-mx-1"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <PlaygroundTypeReferenceForm
                                    typeReference={itemType}
                                    value={item}
                                    onChange={(newItem) =>
                                        handleChangeItem(idx, typeof newItem === "function" ? newItem(item) : newItem)
                                    }
                                />
                            </div>
                        </li>
                    ))}
                    <li>
                        <Button icon={<Plus />} text="Add new item" onClick={appendItem} outlined={true} fill={true} />
                    </li>
                </ul>
            )}
            {valueAsList.length === 0 && (
                <Button icon={<Plus />} text="Add new item" onClick={appendItem} outlined={true} fill={true} />
            )}
        </div>
    );
};
