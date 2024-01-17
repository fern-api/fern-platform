import { Button } from "@blueprintjs/core";
import { Cross, Plus } from "@blueprintjs/icons";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { isPlainObject } from "@fern-ui/core-utils";
import { FC, useCallback, useEffect, useState } from "react";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { getDefaultValueForType, unknownToString } from "./utils";

interface PlaygroundMapFormProps {
    keyType: APIV1Read.TypeReference;
    valueType: APIV1Read.TypeReference;
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

export const PlaygroundMapForm: FC<PlaygroundMapFormProps> = ({ keyType, valueType, onChange, value }) => {
    const { resolveTypeById } = useApiPlaygroundContext();

    const [internalState, setInternalState] = useState<Array<{ key: unknown; value: unknown }>>(() =>
        toKeyValuePairs(value)
    );

    useEffect(() => {
        onChange(fromKeyValuePairs(internalState));
    }, [internalState, onChange]);

    const handleAppendItem = useCallback(() => {
        setInternalState((oldState) => [
            ...oldState,
            {
                key: getDefaultValueForType(keyType, resolveTypeById),
                value: getDefaultValueForType(valueType, resolveTypeById),
            },
        ]);
    }, [keyType, resolveTypeById, valueType]);

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
        <div>
            {internalState.length > 0 && (
                <ul className="border-border-default-light dark:border-border-default-dark w-full list-none space-y-4 border-l pl-4">
                    {internalState.map((item, idx) => (
                        <li key={idx} className="flex gap-4">
                            <PlaygroundTypeReferenceForm
                                typeReference={keyType}
                                value={item.key}
                                onChange={(newKey) => handleChangeKey(idx, newKey)}
                            />
                            <PlaygroundTypeReferenceForm
                                typeReference={valueType}
                                value={item.value}
                                onChange={(newValue) => handleChangeValue(idx, newValue)}
                            />
                            <div>
                                <Button icon={<Cross />} onClick={() => handleRemoveItem(idx)} minimal={true} />
                            </div>
                        </li>
                    ))}
                    <li>
                        <Button
                            icon={<Plus />}
                            text="Add new item"
                            onClick={handleAppendItem}
                            outlined={true}
                            fill={true}
                        />
                    </li>
                </ul>
            )}
            {internalState.length === 0 && (
                <Button icon={<Plus />} text="Add new item" onClick={handleAppendItem} outlined={true} fill={true} />
            )}
        </div>
    );
};
