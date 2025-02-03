// import { Property, TypeIdKey, TypeId } from "@fern-api/fdr-sdk/navigation";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import clsx from "clsx";
import { ReactElement, useCallback, useMemo } from "react";
import { noop } from "ts-essentials";
import { WithLabel } from "../WithLabel";
import { castToRecord } from "../utils";
import { PlaygroundMapForm } from "./PlaygroundMapForm";

const ADDITIONAL_PROPERTIES_KEY_SHAPE = {
  type: "primitive",
  value: {
    type: "string",
    format: undefined,
    regex: undefined,
    minLength: undefined,
    maxLength: undefined,
    default: undefined,
  },
} as const;

const ADDITIONAL_PROPERTIES_VALUE_SHAPE = {
  type: "primitive",
  value: {
    type: "string",
    format: undefined,
    regex: undefined,
    minLength: undefined,
    maxLength: undefined,
    default: undefined,
  },
} as const;

// TODO: This is hardcoded for now, but change to dynamic type references, by setting value
const ADDITIONAL_PROPERTIES_DEFAULT_SHAPE = {
  type: "alias",
  value: {
    type: "optional",
    shape: {
      type: "alias",
      value: {
        type: "map",
        keyShape: {
          type: "alias",
          value: ADDITIONAL_PROPERTIES_KEY_SHAPE,
        },
        valueShape: {
          type: "alias",
          value: ADDITIONAL_PROPERTIES_VALUE_SHAPE,
        },
      },
    },
    default: undefined,
  },
} as const;

interface PlaygroundAdditionalPropertiesProps {
  onChange: (dispatch: unknown) => void;
  properties: readonly ApiDefinition.ObjectProperty[];
  extraProperties: ApiDefinition.TypeReference;
  value: unknown;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}

export function PlaygroundAdditionalProperties({
  onChange,
  properties,
  // TODO: this should be used:
  // extraProperties,
  value,
  types,
}: PlaygroundAdditionalPropertiesProps): ReactElement {
  const additionalProperties = useMemo(() => {
    // remove property keys from value
    const valueAsRecord = castToRecord(value);

    const additionalPropertiesOnly: Record<string, unknown> = {};

    Object.keys(valueAsRecord).forEach((key) => {
      if (!properties.some((p) => p.key === key)) {
        additionalPropertiesOnly[key] = valueAsRecord[key];
      }
    });

    return additionalPropertiesOnly;
  }, [properties, value]);

  const handleChange = useCallback(
    (dispatch: unknown) => {
      onChange((prev: unknown) => {
        const castedPrev = castToRecord(prev);
        const newValue =
          typeof dispatch === "function" ? dispatch(prev) : dispatch;

        // spread in the properties that are not in the extraProperties
        const obj = { ...newValue };
        Object.keys(castedPrev).forEach((key) => {
          if (properties.find((p) => p.key === key)) {
            obj[key] = castedPrev[key];
          }
        });
        return obj;
      });
    },
    [onChange, properties]
  );

  return (
    <div className={clsx("mt-8 min-w-0 flex-1 shrink")}>
      <WithLabel
        property={{
          key: ApiDefinition.PropertyKey("Optional Extra Properties"),
          valueShape: ADDITIONAL_PROPERTIES_DEFAULT_SHAPE,
          description: undefined,
          availability: undefined,
        }}
        value={"Optional Extra Properties"}
        onRemove={noop}
        types={types}
      >
        <PlaygroundMapForm
          id="extraProperties"
          keyShape={ADDITIONAL_PROPERTIES_KEY_SHAPE}
          valueShape={ADDITIONAL_PROPERTIES_VALUE_SHAPE}
          onChange={handleChange}
          value={additionalProperties}
          types={types}
        />
      </WithLabel>
    </div>
  );
}
