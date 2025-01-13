import { FernButton, FernButtonGroup, FernCard } from "@fern-docs/components";
import {
  Microphone,
  MicrophoneSpeaking,
  Page,
  PagePlusIn,
  Undo,
  Xmark,
} from "iconoir-react";
import { motion, AnimatePresence } from "framer-motion";
import cn from "clsx";
import numeral from "numeral";
import { ChangeEvent, DragEventHandler, memo, useRef, useState } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";

export interface PlaygroundFileUploadFormProps {
  id: string;
  propertyKey: string;
  type: "file" | "files";
  isOptional?: boolean;
  onValueChange: (value: readonly File[] | undefined) => void;
  value: readonly File[] | undefined;
  allowAudioRecording?: boolean;
}

export const PlaygroundFileUploadForm = memo<PlaygroundFileUploadFormProps>(
  ({
    id,
    propertyKey,
    type,
    isOptional,
    onValueChange,
    value,
    allowAudioRecording = true,
  }) => {
    const [drag, setDrag] = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    const [
      { isRecording, elapsedTime, volume },
      { startRecording, stopRecording },
    ] = useAudioRecorder(({ file }) => onValueChange([file]));

    const dragOver: DragEventHandler = (e) => {
      e.preventDefault();
    };

    const dragEnter: DragEventHandler = (e) => {
      e.preventDefault();
      setDrag(true);
    };

    const dragLeave: DragEventHandler = (e) => {
      e.preventDefault();
      setDrag(false);
    };

    const fileDrop: DragEventHandler = (e) => {
      e.preventDefault();
      setDrag(false);
      const files = Array.from(e.dataTransfer.files);
      onValueChange(files);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      onValueChange(files);
    };

    return (
      <>
        <input
          ref={ref}
          type="file"
          accept="audio/*"
          multiple={type === "files"}
          onChange={handleFileChange}
          className="hidden"
        />
        <FernCard
          className={cn("w-full rounded-lg", {
            elevated: drag,
          })}
          onDragOver={dragOver}
          onDragEnter={dragEnter}
          onDragLeave={dragLeave}
          onDrop={fileDrop}
        >
          {isRecording ? (
            <div className="flex items-center gap-4 p-4">
              <MicrophoneSpeaking className="text-primary animate-pulse" />
              <div className="flex-1 pl-1">
                <div className="flex items-center gap-3">
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
              <FernButton
                variant="minimal"
                intent="danger"
                onClick={stopRecording}
                text="Stop"
              />
            </div>
          ) : value == null || value.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-6">
              <h5>Drop audio files here to upload</h5>
              <div className="flex gap-2">
                <FernButton
                  onClick={() => ref.current?.click()}
                  text="Browse files"
                  rounded
                  variant="outlined"
                  intent="primary"
                />
                {allowAudioRecording && (
                  <FernButton
                    onClick={startRecording}
                    icon={<Microphone />}
                    rounded
                    variant="outlined"
                    intent="primary"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="divide-default divide-y">
              {value.map((file) => (
                <div key={file.name} className="flex justify-between px-4 py-2">
                  <div className="flex min-w-0 shrink items-center gap-2">
                    <div>
                      <Page />
                    </div>
                    <span className="inline-flex min-w-0 shrink items-baseline gap-2">
                      <span className="truncate text-sm">{file.name}</span>
                      <span className="t-muted text-xs">
                        ({numeral(file.size).format("0.0b")})
                      </span>
                    </span>
                  </div>
                  <FernButtonGroup className="-mr-2">
                    <FernButton
                      text="Change"
                      onClick={() => ref.current?.click()}
                      size="small"
                      variant="minimal"
                    />
                    {allowAudioRecording && (
                      <FernButton
                        icon={<Undo />}
                        onClick={startRecording}
                        size="small"
                        variant="minimal"
                      />
                    )}
                    <FernButton
                      icon={<Xmark />}
                      size="small"
                      variant="minimal"
                      onClick={() => {
                        onValueChange([]);
                        if (ref.current != null) {
                          ref.current.value = "";
                        }
                      }}
                    />
                  </FernButtonGroup>
                </div>
              ))}
            </div>
          )}
        </FernCard>
      </>
    );
  }
);

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
