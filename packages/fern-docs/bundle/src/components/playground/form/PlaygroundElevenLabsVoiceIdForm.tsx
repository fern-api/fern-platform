"use client";

import { ReactElement, useEffect, useMemo, useState } from "react";

import { ChevronDown } from "lucide-react";

import {
  FernButton,
  FernDropdown,
  FernInput,
  FernInputProps,
} from "@fern-docs/components";

interface Voice {
  voice_id: string;
  name: string;
}

interface VoicesResponse {
  voices: Voice[];
}

export function PlaygroundElevenLabsVoiceIdForm(
  props: FernInputProps
): ReactElement<any> {
  const [voices, setVoices] = useState<VoicesResponse>({ voices: [] });

  useEffect(() => {
    void fetch("https://api.elevenlabs.io/v1/voices")
      .then((response) => response.json())
      .then(setVoices);
  }, []);

  const options = useMemo(
    () =>
      voices.voices.map(
        (voice): FernDropdown.Option => ({
          type: "value",
          label: voice.name,
          value: voice.voice_id,
        })
      ),
    [voices.voices]
  );

  const activeItem = options
    .filter((o): o is FernDropdown.ValueOption => o.type === "value")
    .find((option) => option.value === props.value);

  if (voices.voices.length === 0) {
    return <FernInput {...props} />;
  }

  return (
    <FernDropdown
      options={options}
      onValueChange={props.onValueChange}
      value={props.value}
    >
      <FernButton
        id={props.id}
        text={
          activeItem != null ? (
            <span className="font-mono">
              {activeItem.label ?? activeItem.value}
            </span>
          ) : (
            <span className="text-(color:--grayscale-a11)">
              Select an enum...
            </span>
          )
        }
        variant="outlined"
        rightIcon={<ChevronDown />}
        className="w-full text-left"
        disabled={props.disabled}
      />
    </FernDropdown>
  );
}
