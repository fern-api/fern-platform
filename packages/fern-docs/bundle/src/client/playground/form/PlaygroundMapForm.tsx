import {
  TypeDefinition,
  TypeShapeOrReference,
} from "@fern-api/fdr-sdk/api-definition";
import { isPlainObject, unknownToString } from "@fern-api/ui-core-utils";
import { FernButton } from "@fern-docs/components";
import { Plus, X } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { getEmptyValueForType } from "../utils";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";

interface PlaygroundMapFormProps {
  id: string;
  keyShape: TypeShapeOrReference;
  valueShape: TypeShapeOrReference;
  onChange: (value: unknown) => void;
  value: unknown;
  types: Record<string, TypeDefinition>;
}

function toKeyValuePairs(value: unknown): { key: unknown; value: unknown }[] {
  if (isPlainObject(value)) {
    return Object.entries(value).map(([key, value]) => ({ key, value }));
  }
  return [];
}

function fromKeyValuePairs(
  keyValuePairs: { key: unknown; value: unknown }[]
): unknown {
  return keyValuePairs.reduce<Record<string, unknown>>((acc, item) => {
    const key = unknownToString(item.key);
    acc[key] = item.value;
    return acc;
  }, {});
}

export const PlaygroundMapForm = memo<PlaygroundMapFormProps>((props) => {
  const { id, keyShape, valueShape, onChange, value, types } = props;
  const [internalState, setInternalState] = useState<
    { key: unknown; value: unknown }[]
  >(() => toKeyValuePairs(value));

  useEffect(() => {
    onChange(fromKeyValuePairs(internalState));
  }, [internalState, onChange]);

  const handleAppendItem = useCallback(() => {
    setInternalState((oldState) => [
      ...oldState,
      {
        key: getEmptyValueForType(keyShape, types),
        value: getEmptyValueForType(valueShape, types),
      },
    ]);
  }, [keyShape, types, valueShape]);

  const handleChangeKey = useCallback((idx: number, newKey: unknown) => {
    setInternalState((oldState) => {
      const nextState = {
        key: oldState[idx]?.key ?? "",
        value: oldState[idx]?.value ?? "",
      };
      nextState.key =
        (typeof newKey === "function" ? newKey(nextState.key) : newKey) ?? "";
      return [...oldState.slice(0, idx), nextState, ...oldState.slice(idx + 1)];
    });
  }, []);

  const handleChangeValue = useCallback((idx: number, newValue: unknown) => {
    setInternalState((oldState) => {
      const nextState = {
        key: oldState[idx]?.key ?? "",
        value: oldState[idx]?.value ?? "",
      };
      nextState.value =
        (typeof newValue === "function"
          ? newValue(nextState.value)
          : newValue) ?? "";
      return [...oldState.slice(0, idx), nextState, ...oldState.slice(idx + 1)];
    });
  }, []);

  const handleRemoveItem = useCallback((idx: number) => {
    setInternalState((oldArray) => [
      ...oldArray.slice(0, idx),
      ...oldArray.slice(idx + 1),
    ]);
  }, []);

  return (
    <>
      {internalState.length > 0 && (
        <ul className="border-default divide-default w-full max-w-full list-none divide-y divide-dashed border-t border-dashed">
          {internalState.map((item, idx) => (
            <PlaygroundMapItemForm
              key={idx}
              idx={idx}
              id={id}
              keyShape={keyShape}
              valueShape={valueShape}
              onKeyChange={handleChangeKey}
              onValueChange={handleChangeValue}
              onRemoveItem={handleRemoveItem}
              item={item}
              types={types}
            />
          ))}
          <li className="pt-2">
            <FernButton
              icon={<Plus />}
              text="Add new item"
              onClick={handleAppendItem}
              variant="outlined"
              className="w-full"
            />
          </li>
        </ul>
      )}
      {internalState.length === 0 && (
        <FernButton
          icon={<Plus />}
          text="Add new item"
          onClick={handleAppendItem}
          variant="outlined"
          className="w-full"
        />
      )}
    </>
  );
});

interface PlaygroundMapItemFormProps {
  idx: number;
  id: string;
  keyShape: TypeShapeOrReference;
  valueShape: TypeShapeOrReference;
  onKeyChange: (idx: number, value: unknown) => void;
  onValueChange: (idx: number, value: unknown) => void;
  onRemoveItem: (idx: number) => void;
  item: { key: unknown; value: unknown };
  types: Record<string, TypeDefinition>;
}

function PlaygroundMapItemForm({
  idx,
  id,
  keyShape,
  valueShape,
  onKeyChange,
  onValueChange,
  onRemoveItem,
  item,
  types,
}: PlaygroundMapItemFormProps) {
  const handleChangeKey = useCallback(
    (newKey: unknown) => {
      onKeyChange(idx, newKey);
    },
    [onKeyChange, idx]
  );

  const handleChangeValue = useCallback(
    (newValue: unknown) => {
      onValueChange(idx, newValue);
    },
    [onValueChange, idx]
  );

  return (
    <li key={idx} className="flex min-h-12 flex-row items-start gap-1 py-2">
      {/* <div className="flex min-w-0 shrink items-center justify-between gap-2">
                <label className="inline-flex flex-wrap items-baseline">
                    <span className="t-muted bg-tag-default min-w-6 rounded-xl p-1 text-center text-xs font-semibold uppercase">
                        {idx + 1}
                    </span>
                </label>
            </div> */}

      <div className="min-w-0 flex-1 shrink">
        <span className="t-muted text-xs">{"key"}</span>
        <PlaygroundTypeReferenceForm
          id={`${id}[${idx}].key`}
          shape={keyShape}
          value={item.key}
          onChange={handleChangeKey}
          types={types}
        />
      </div>
      <div className="min-w-0 flex-1 shrink">
        <span className="t-muted text-xs">{"value"}</span>
        <PlaygroundTypeReferenceForm
          id={`${id}[${idx}].value`}
          shape={valueShape}
          value={item.value}
          onChange={handleChangeValue}
          types={types}
        />
      </div>
      <div>
        <FernButton
          icon={<X />}
          onClick={() => onRemoveItem(idx)}
          variant="minimal"
          size="small"
          className="-ml-1 -mr-3 opacity-50 transition-opacity hover:opacity-100"
        />
      </div>
    </li>
  );
}

PlaygroundMapForm.displayName = "PlaygroundMapForm";
