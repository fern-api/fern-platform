import { FernButton, FernButtonGroup, FernCard } from "@fern-docs/components";
import {
  Microphone,
  MicrophoneSpeaking,
  Page,
  Xmark,
  PagePlusIn,
} from "iconoir-react";
import cn from "clsx";
import { uniqBy } from "es-toolkit/array";
import numeral from "numeral";
import {
  ChangeEvent,
  DragEventHandler,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { WaveformAnimation } from "./PlaygroundWaveformAnimation";
import { PlaygroundAudioControls } from "./PlaygroundAudioControls";
import { WithLabelInternal } from "../WithLabel";

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
        const hasInvalidFiles = value.some((f) => !(f instanceof File));
        if (hasInvalidFiles) {
          onValueChange(value.filter((f) => f instanceof File));
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [drag, setDrag] = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    const [audioUrls, setAudioUrls] = useState<Map<string, string>>(new Map());
    const [fileToReplace, setFileToReplace] = useState<File | null>(null);

    useEffect(() => {
      return () => {
        audioUrls.forEach((url) => URL.revokeObjectURL(url));
      };
    }, [audioUrls]);

    const [
      { isRecording, elapsedTime, volume },
      { startRecording, stopRecording },
    ] = useAudioRecorder(({ file, url }) => {
      const newUrls = new Map(audioUrls);

      if (type === "files") {
        if (fileToReplace) {
          const oldUrl = audioUrls.get(fileToReplace.name);
          if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
          }
          newUrls.delete(fileToReplace.name);

          newUrls.set(file.name, url);
          setAudioUrls(newUrls);

          onValueChange(
            value?.map((f) => (f === fileToReplace ? file : f)) ?? [file]
          );
          setFileToReplace(null);
        } else {
          newUrls.set(file.name, url);
          setAudioUrls(newUrls);
          onValueChange([...(value ?? []), file]);
        }
      } else {
        audioUrls.forEach((existingUrl) => URL.revokeObjectURL(existingUrl));
        setAudioUrls(new Map([[file.name, url]]));
        onValueChange([file]);
      }
    });

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

    const handleRemoveFile = (fileToRemove: File) => {
      const url = audioUrls.get(fileToRemove.name);
      if (url) {
        URL.revokeObjectURL(url);
        const newUrls = new Map(audioUrls);
        newUrls.delete(fileToRemove.name);
        setAudioUrls(newUrls);
      }
      onValueChange(value?.filter((f) => f !== fileToRemove));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files != null) {
        if (type === "file") {
          audioUrls.forEach((url) => URL.revokeObjectURL(url));
          setAudioUrls(new Map());
        }
        handleChangeFiles(files);
      }

      if (ref.current != null) {
        ref.current.value = "";
      }
    };

    const handleStartRecording = (fileToReplace?: File) => {
      if (fileToReplace) {
        setFileToReplace(fileToReplace);
      }
      startRecording();
    };

    return (
      <WithLabelInternal
        propertyKey={propertyKey}
        value={value}
        onRemove={() => handleRemoveFile(value?.[0]!)}
        isRequired={!isOptional}
        typeShorthand={type === "file" ? "file" : "multiple files"}
        availability={undefined}
        description={undefined}
      >
        <input
          ref={ref}
          id={id}
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
                icon={
                  isRecording ? (
                    <MicrophoneSpeaking className="animate-pulse" />
                  ) : (
                    <Microphone />
                  )
                }
                variant="minimal"
                intent={isRecording ? "danger" : "primary"}
                onClick={isRecording ? stopRecording : startRecording}
              />
            </div>
          ) : value == null || value.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-6">
              <h5>
                {`Drop audio file${type === "files" ? "s" : ""} here to upload`}
              </h5>
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
                    icon={<Microphone />}
                    onClick={() => handleStartRecording()}
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
                    {audioUrls.get(file.name) && (
                      <PlaygroundAudioControls
                        audioUrl={audioUrls.get(file.name)!}
                      />
                    )}
                    {!audioUrls.get(file.name) && (
                      <FernButton
                        text="Change"
                        onClick={() => ref.current?.click()}
                        size="small"
                        variant="minimal"
                      />
                    )}
                    {allowAudioRecording && (
                      <FernButton
                        icon={<Microphone />}
                        onClick={() => handleStartRecording(file)}
                        size="small"
                        variant="minimal"
                      />
                    )}
                    <FernButton
                      icon={<Xmark />}
                      size="small"
                      variant="minimal"
                      onClick={() => handleRemoveFile(file)}
                    />
                  </FernButtonGroup>
                </div>
              ))}
              {type === "files" && (
                <div className="flex justify-end p-4">
                  <div className="flex items-center gap-2">
                    <FernButton
                      onClick={() => ref.current?.click()}
                      icon={<PagePlusIn />}
                      text="Add more files"
                      rounded
                      variant="outlined"
                      intent="primary"
                    />
                    {allowAudioRecording && (
                      <FernButton
                        onClick={() => handleStartRecording()}
                        icon={<Microphone />}
                        rounded
                        variant="outlined"
                        intent="primary"
                      />
                    )}
                  </div>
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
