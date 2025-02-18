import { memo, useCallback } from "react";

import { clsx } from "clsx";
import { Plus, Xmark } from "iconoir-react";

import {
  TypeDefinition,
  TypeShapeOrReference,
} from "@fern-api/fdr-sdk/api-definition";
import { FernButton } from "@fern-docs/components";

import { getEmptyValueForType, shouldRenderInline } from "../utils";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";

interface PlaygroundListFormProps {
  itemShape: TypeShapeOrReference;
  onChange: (value: unknown) => void;
  value: unknown;
  id: string;
  types: Record<string, TypeDefinition>;
}

export const PlaygroundListForm = memo<PlaygroundListFormProps>(
  ({ itemShape, onChange, value, id, types }) => {
    const appendItem = useCallback(() => {
      onChange((oldValue: unknown) => {
        const oldArray = Array.isArray(oldValue) ? oldValue : [];
        return [...oldArray, getEmptyValueForType(itemShape, types)];
      });
    }, [itemShape, onChange, types]);
    const valueAsList = Array.isArray(value) ? value : [];
    const handleChangeItem = useCallback(
      (idx: number, newValue: unknown) => {
        onChange((oldValue: unknown) => {
          const oldArray = Array.isArray(oldValue) ? oldValue : [];
          return [
            ...oldArray.slice(0, idx),
            typeof newValue === "function" ? newValue(oldArray[idx]) : newValue,
            ...oldArray.slice(idx + 1),
          ];
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

    const renderInline = shouldRenderInline(itemShape, types);
    return (
      <>
        {valueAsList.length > 0 && (
          <ul className="border-default divide-border-default w-full max-w-full list-none divide-y divide-dashed border-t border-dashed">
            {valueAsList.map((item, idx) => (
              <PlaygroundListItemForm
                key={idx}
                id={id}
                idx={idx}
                renderInline={renderInline}
                itemShape={itemShape}
                item={item}
                onChange={handleChangeItem}
                types={types}
                onRemove={handleRemoveItem}
              />
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
  }
);

interface PlaygroundListItemFormProps {
  id: string;
  idx: number;
  renderInline: boolean;
  itemShape: TypeShapeOrReference;
  item: unknown;
  onChange: (idx: number, newValue: unknown) => void;
  types: Record<string, TypeDefinition>;
  onRemove: (idx: number) => void;
}

function PlaygroundListItemForm({
  id,
  idx,
  renderInline,
  itemShape,
  item,
  onChange,
  types,
  onRemove,
}: PlaygroundListItemFormProps) {
  const handleChangeItem = useCallback(
    (newItem: unknown) =>
      onChange(idx, (prev: unknown) =>
        typeof newItem === "function" ? newItem(prev) : newItem
      ),
    [onChange, idx]
  );

  return (
    <li
      key={idx}
      className={clsx("min-h-12 w-full space-y-2", {
        "py-2": renderInline,
        "pb-4 pt-2": !renderInline,
      })}
    >
      <div className="flex min-w-0 shrink items-center justify-between gap-2">
        <label className="inline-flex flex-wrap items-baseline">
          <span className="text-muted bg-tag-default min-w-6 rounded-xl p-1 text-center text-xs font-semibold uppercase">
            {idx + 1}
          </span>
        </label>

        {renderInline && (
          <PlaygroundTypeReferenceForm
            shape={itemShape}
            value={item}
            onChange={handleChangeItem}
            renderAsPanel={true}
            id={`${id}[${idx}]`}
            types={types}
          />
        )}

        <FernButton
          icon={<Xmark />}
          onClick={() => onRemove(idx)}
          variant="minimal"
          size="small"
          className="-ml-1 -mr-3 opacity-50 transition-opacity hover:opacity-100"
        />
      </div>

      {!renderInline && (
        <PlaygroundTypeReferenceForm
          shape={itemShape}
          value={item}
          onChange={handleChangeItem}
          renderAsPanel={true}
          id={`${id}[${idx}]`}
          types={types}
        />
      )}
    </li>
  );
}

PlaygroundListForm.displayName = "PlaygroundListForm";
