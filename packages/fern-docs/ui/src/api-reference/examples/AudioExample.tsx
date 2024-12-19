import { FernAudioPlayer } from "@fern-docs/components";
import { FC } from "react";
import { useFeatureFlags } from "../../atoms";
import { FernErrorBoundary } from "../../components/FernErrorBoundary";
import { TitledExample } from "./TitledExample";

export declare namespace AudioExample {
  export interface Props
    extends Omit<TitledExample.Props, "copyToClipboardText"> {}
}

const AudioExampleInternal: FC<AudioExample.Props> = ({ ...props }) => {
  const { isAudioExampleInternal } = useFeatureFlags();

  if (!isAudioExampleInternal) {
    return null;
  }
  return (
    <TitledExample {...props}>
      <FernAudioPlayer
        src="https://files.buildwithfern.com/elevenlabs-apiref.mp3"
        title={"Audio by ElevenLabs"}
        className="p-4"
      />
    </TitledExample>
  );
};

export const AudioExample: FC<AudioExample.Props> = (props) => {
  return (
    <FernErrorBoundary component="AudioExample">
      <AudioExampleInternal {...props} />
    </FernErrorBoundary>
  );
};
