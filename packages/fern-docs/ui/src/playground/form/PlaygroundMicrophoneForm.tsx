import { FernButton, FernInput, FernInputProps } from "@fern-docs/components";
import { Microphone, MicrophoneSpeaking, Undo } from "iconoir-react";
import { ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { WaveformAnimation } from "./PlaygroundWaveformAnimation";
import { PlaygroundAudioControls } from "./PlaygroundAudioControls";

export interface PlaygroundMicrophoneFormProps extends FernInputProps {
  onAudioData?: (base64Data: string) => void;
}

export function PlaygroundMicrophoneForm({
  onAudioData,
  ...props
}: PlaygroundMicrophoneFormProps): ReactElement {
  const [
    { isRecording, elapsedTime, volume, audioUrl },
    { startRecording, stopRecording },
  ] = useAudioRecorder(({ base64 }) => onAudioData?.(base64));

  return (
    <div className={props.className}>
      <div className="flex items-center gap-2">
        {audioUrl && !isRecording && (
          <PlaygroundAudioControls audioUrl={audioUrl} />
        )}
        <div className="relative flex-1">
          <AnimatePresence initial={false}>
            {!isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full"
              >
                <FernInput
                  {...props}
                  className="w-full"
                  disabled={props.disabled}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence initial={false}>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-primary absolute inset-0 flex w-full items-center rounded-lg px-2 text-black"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="h-3 w-full">
                      <WaveformAnimation volume={volume} />
                    </div>
                    <span className="font-mono text-sm">
                      {Math.floor(elapsedTime / 60)
                        .toString()
                        .padStart(2, "0")}
                      :{(elapsedTime % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <FernButton
          icon={
            !isRecording && elapsedTime > 0 ? (
              <Undo />
            ) : isRecording ? (
              <MicrophoneSpeaking className="animate-pulse" />
            ) : (
              <Microphone />
            )
          }
          size="small"
          variant="minimal"
          intent={isRecording ? "danger" : "primary"}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={props.disabled}
        />
      </div>
    </div>
  );
}
