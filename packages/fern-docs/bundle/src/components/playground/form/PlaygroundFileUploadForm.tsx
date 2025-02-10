import {
  ChangeEvent,
  DragEventHandler,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";

import { FernButton, FernButtonGroup, FernCard } from "@fern-docs/components";
import cn from "clsx";
import { uniqBy } from "es-toolkit/array";
import { File, FilePlus, Mic, X } from "lucide-react";
import numeral from "numeral";

import { WithLabelInternal } from "../WithLabel";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { PlaygroundAudioControls } from "./PlaygroundAudioControls";
import { WaveformAnimation } from "./PlaygroundWaveformAnimation";

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
    // Remove invalid files
    // TODO: This is a temporary workaround to remove invalid files from the value.
    // this should be handled in a better way
    useEffect(() => {
      if (value != null) {
        const hasInvalidFiles = value.some((f) => !isValidFile(f));
        if (hasInvalidFiles) {
          onValueChange(value.filter(isValidFile));
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [drag, setDrag] = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    const [
      { isRecording, elapsedTime, volume, audioUrl, isSupported },
      { startRecording, stopRecording },
    ] = useAudioRecorder(({ file }) => onValueChange([file]));

    const canRecordAudio = isSupported && allowAudioRecording;

    const dragOver: DragEventHandler = (e) => {
      e.preventDefault();
      setDrag(true);
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

    const handleChangeFiles = (files: FileList | null | undefined) => {
      const filesArray = files != null ? Array.from(files) : [];
      if (type === "files") {
        // append files
        onValueChange(uniqueFiles([...(value ?? []), ...filesArray]));
        return;
      } else {
        // replace files
        onValueChange(filesArray.length > 0 ? filesArray : undefined);
      }
    };

    const handleRemove = () => {
      onValueChange(undefined);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files != null) {
        handleChangeFiles(files);
      }

      // Clear input value to allow selecting same file again
      if (ref.current != null) {
        ref.current.value = "";
      }
    };

    return (
      <WithLabelInternal
        propertyKey={propertyKey}
        value={value}
        onRemove={handleRemove}
        isRequired={!isOptional}
        typeShorthand={type === "file" ? "file" : "multiple files"}
        availability={undefined}
        description={undefined}
      >
        <input
          ref={ref}
          id={id}
          type="file"
          accept={"*"} //
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
              <div className="flex-1">
                <div className="flex items-center gap-3 p-2">
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
                icon={isRecording ? <Mic className="animate-pulse" /> : <Mic />}
                variant="minimal"
                intent={isRecording ? "danger" : "primary"}
                onClick={isRecording ? stopRecording : startRecording}
              />
            </div>
          ) : value == null || value.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-6">
              <h5>
                {`Drop file${type === "files" ? "s" : ""} here to upload`}
              </h5>
              <div className="flex gap-2">
                <FernButton
                  onClick={() => ref.current?.click()}
                  text="Browse files"
                  rounded
                  variant="outlined"
                  intent="primary"
                />
                {canRecordAudio && (
                  <FernButton
                    onClick={startRecording}
                    icon={<Mic />}
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
                    <div className="p-1">
                      <File />
                    </div>
                    <span className="inline-flex min-w-0 shrink items-baseline gap-2">
                      <span className="truncate text-sm">{file.name}</span>
                      <span className="t-muted text-xs">
                        ({numeral(file.size).format("0.0b")})
                      </span>
                    </span>
                  </div>
                  <FernButtonGroup className="-mr-2">
                    {audioUrl && (
                      <PlaygroundAudioControls audioUrl={audioUrl} />
                    )}
                    {!audioUrl && (
                      <FernButton
                        text="Change"
                        onClick={() => ref.current?.click()}
                        size="small"
                        variant="minimal"
                      />
                    )}
                    {canRecordAudio && (
                      <FernButton
                        icon={<Mic />}
                        onClick={startRecording}
                        size="small"
                        variant="minimal"
                      />
                    )}
                    <FernButton
                      icon={<X />}
                      size="small"
                      variant="minimal"
                      onClick={() => {
                        onValueChange(value.filter((f) => f !== file));
                        if (ref.current != null) {
                          ref.current.value = "";
                        }
                      }}
                    />
                  </FernButtonGroup>
                </div>
              ))}
              {type === "files" && (
                // TODO: allow multiple recordings
                <div className="flex justify-end p-4">
                  <FernButton
                    onClick={() => ref.current?.click()}
                    icon={<FilePlus />}
                    text="Add more files"
                    rounded
                    variant="outlined"
                    intent="primary"
                  />
                </div>
              )}
            </div>
          )}
        </FernCard>
      </WithLabelInternal>
    );
  }
);

PlaygroundFileUploadForm.displayName = "PlaygroundFileUploadForm";

function uniqueFiles(files: File[]): readonly File[] | undefined {
  return uniqBy(files, (f) => `${f.webkitRelativePath}/${f.name}/${f.size}`);
}

function isValidFile(file: any): file is File {
  return (
    file != null &&
    typeof file === "object" &&
    "name" in file &&
    "size" in file &&
    "type" in file
  );
}
