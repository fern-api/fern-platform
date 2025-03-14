"use client";

import { ReactElement } from "react";

import { Mic, RotateCcw } from "lucide-react";
import { AnimatePresence, LazyMotion, domAnimation } from "motion/react";
import * as m from "motion/react-m";

import { FernButton, FernInput, FernInputProps } from "@fern-docs/components";

import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { PlaygroundAudioControls } from "./PlaygroundAudioControls";
import { WaveformAnimation } from "./PlaygroundWaveformAnimation";

export interface PlaygroundMicrophoneFormProps extends FernInputProps {
  onAudioData?: (base64Data: string) => void;
}

export function PlaygroundMicrophoneForm({
  onAudioData,
  ...props
}: PlaygroundMicrophoneFormProps): ReactElement<any> {
  const [
    { isRecording, elapsedTime, volume, audioUrl },
    { startRecording, stopRecording },
  ] = useAudioRecorder(({ base64 }) => onAudioData?.(base64));

  return (
    <div className={props.className}>
      <div className="flex min-w-0 shrink items-center justify-between gap-1">
        {audioUrl && !isRecording && (
          <PlaygroundAudioControls audioUrl={audioUrl} />
        )}
        <div className="relative flex-1">
          <LazyMotion features={domAnimation}>
            <AnimatePresence initial={false}>
              {!isRecording && (
                <m.div
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
                </m.div>
              )}
            </AnimatePresence>
            <AnimatePresence initial={false}>
              {isRecording && (
                <m.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-primary text-body rounded-2 absolute inset-0 flex w-full items-center px-2"
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
                </m.div>
              )}
            </AnimatePresence>
          </LazyMotion>
        </div>
        <FernButton
          icon={
            !isRecording && elapsedTime > 0 ? (
              <RotateCcw />
            ) : isRecording ? (
              <Mic className="animate-pulse" />
            ) : (
              <Mic />
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
