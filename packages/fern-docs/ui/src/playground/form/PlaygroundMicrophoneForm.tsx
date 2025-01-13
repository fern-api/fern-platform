import { FernButton, FernInput, FernInputProps } from "@fern-docs/components";
import { Microphone, MicrophoneSpeaking, Undo } from "iconoir-react";
import { ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioRecorder } from "../hooks/useAudioRecorder";

export interface PlaygroundMicrophoneFormProps extends FernInputProps {
  onAudioData?: (base64Data: string) => void;
}

export function PlaygroundMicrophoneForm({
  onAudioData,
  ...props
}: PlaygroundMicrophoneFormProps): ReactElement {
  const [
    { isRecording, elapsedTime, volume },
    { startRecording, stopRecording },
  ] = useAudioRecorder(({ base64 }) => onAudioData?.(base64));

  return (
    <div className={props.className}>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <AnimatePresence initial={false}>
            {!isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
                className="bg-primary absolute inset-0 flex w-full items-center rounded-lg px-4 py-2 text-black"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
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
          intent={isRecording ? "danger" : "primary"}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={props.disabled}
        />
      </div>
    </div>
  );
}

function WaveformAnimation({ volume }: { volume: number }) {
  return (
    <div className="flex h-full w-full items-center justify-between gap-0.5">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="h-full w-0.5 bg-black"
          animate={{
            scaleY: [0.2, Math.max(0.4, Math.min(volume, 1)), 0.2],
          }}
          transition={{
            duration: 1 - volume * 0.5,
            repeat: Infinity,
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}
