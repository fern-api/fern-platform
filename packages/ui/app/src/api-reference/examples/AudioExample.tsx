import { FernAudioPlayer } from "@fern-ui/components";
import { FC } from "react";
import { useFeatureFlags } from "../../atoms";
import { FernErrorBoundary } from "../../components/FernErrorBoundary";
import { TitledExample } from "./TitledExample";

export declare namespace AudioExample {
    export interface Props extends Omit<TitledExample.Props, "copyToClipboardText"> {}
}

const AudioExampleInternal: FC<AudioExample.Props> = ({ ...props }) => {
    const { isAudioExampleInternal } = useFeatureFlags();

    if (!isAudioExampleInternal) {
        return null;
    }
    return (
        <TitledExample {...props}>
            <FernAudioPlayer
                src="https://eleven-public-cdn.elevenlabs.io/audio-native/d65e433fd8a560cbba1b7dd26809dd48ea2b408c5b6c0a3e42e5b83c43957f5b/ISOcFnHEWohrLHrKmdyq.mp3"
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
