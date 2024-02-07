import { Button } from "@blueprintjs/core";
import { ResolvedTypeReference } from "@fern-ui/app-utils";
import { isPlainObject } from "@fern-ui/core-utils";
import { Cross1Icon, PlusIcon } from "@radix-ui/react-icons";
import { FC, useCallback, useEffect, useState } from "react";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { getDefaultValueForType, unknownToString } from "./utils";

interface PlaygroundMapFormProps {
    keyShape: ResolvedTypeReference;
    valueShape: ResolvedTypeReference;
    onChange: (value: unknown) => void;
    value: unknown;
}

function toKeyValuePairs(value: unknown): Array<{ key: unknown; value: unknown }> {
    if (isPlainObject(value)) {
        return Object.entries(value).map(([key, value]) => ({ key, value }));
    }
    return [];
}

function fromKeyValuePairs(keyValuePairs: Array<{ key: unknown; value: unknown }>): unknown {
    return keyValuePairs.reduce<Record<string, unknown>>((acc, item) => {
        const key = unknownToString(item.key);
        acc[key] = item.value;
        return acc;
    }, {});
}

export const PlaygroundMapForm: FC<PlaygroundMapFormProps> = ({ keyShape, valueShape, onChange, value }) => {
    const [internalState, setInternalState] = useState<Array<{ key: unknown; value: unknown }>>(() =>
        toKeyValuePairs(value),
    );

    useEffect(() => {
        onChange(fromKeyValuePairs(internalState));
    }, [internalState, onChange]);

    const handleAppendItem = useCallback(() => {
        setInternalState((oldState) => [
            ...oldState,
            {
                key: getDefaultValueForType(keyShape),
                value: getDefaultValueForType(valueShape),
            },
        ]);
    }, [keyShape, valueShape]);

    const handleChangeKey = useCallback((idx: number, newKey: unknown) => {
        setInternalState((oldState) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return [...oldState.slice(0, idx), { ...oldState[idx]!, key: newKey }, ...oldState.slice(idx + 1)];
        });
    }, []);

    const handleChangeValue = useCallback((idx: number, newValue: unknown) => {
        setInternalState((oldState) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return [...oldState.slice(0, idx), { ...oldState[idx]!, value: newValue }, ...oldState.slice(idx + 1)];
        });
    }, []);
    const handleRemoveItem = useCallback((idx: number) => {
        setInternalState((oldArray) => [...oldArray.slice(0, idx), ...oldArray.slice(idx + 1)]);
    }, []);
    return (
        <div>
            {internalState.length > 0 && (
                <ul className="divide-border-default-dark dark:divide-border-default-dark border-border-default-light dark:border-border-default-dark max-w-full list-none divide-y divide-dashed border-t border-dashed">
                    {internalState.map((item, idx) => (
                        <li key={idx} className="flex min-h-12 flex-row items-center gap-1 py-2">
                            <div className="flex min-w-0 shrink items-center justify-between gap-2">
                                <label className="inline-flex flex-wrap items-baseline">
                                    <span className="t-muted bg-tag-default-light dark:bg-tag-default-dark rounded p-1 text-xs uppercase">
                                        {idx + 1}
                                    </span>
                                </label>
                            </div>

                            <div className="min-w-0 flex-1 shrink">
                                <PlaygroundTypeReferenceForm
                                    shape={keyShape}
                                    value={item.key}
                                    onChange={(newKey) => handleChangeKey(idx, newKey)}
                                />
                            </div>
                            <div className="min-w-0 flex-1 shrink">
                                <PlaygroundTypeReferenceForm
                                    shape={valueShape}
                                    value={item.value}
                                    onChange={(newValue) => handleChangeValue(idx, newValue)}
                                />
                            </div>
                            <div>
                                <Button icon={<Cross1Icon />} onClick={() => handleRemoveItem(idx)} minimal={true} />
                            </div>
                        </li>
                    ))}
                    <li className="py-2">
                        <Button
                            icon={<PlusIcon />}
                            text="Add new item"
                            onClick={handleAppendItem}
                            outlined={true}
                            fill={true}
                        />
                    </li>
                </ul>
            )}
            {internalState.length === 0 && (
                <Button
                    icon={<PlusIcon />}
                    text="Add new item"
                    onClick={handleAppendItem}
                    outlined={true}
                    fill={true}
                />
            )}
        </div>
    );
};
