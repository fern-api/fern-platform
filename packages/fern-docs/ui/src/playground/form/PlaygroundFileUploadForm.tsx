import { FernButton, FernButtonGroup, FernCard } from "@fern-docs/components";
import cn from "clsx";
import { uniqBy } from "es-toolkit/array";
import { Page, PagePlusIn, Xmark } from "iconoir-react";
import numeral from "numeral";
import {
  ChangeEvent,
  DragEventHandler,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";
import { WithLabelInternal } from "../WithLabel";

export interface PlaygroundFileUploadFormProps {
  id: string;
  propertyKey: string;
  type: "file" | "files";
  isOptional?: boolean;
  onValueChange: (value: ReadonlyArray<File> | undefined) => void;
  value: ReadonlyArray<File> | undefined;
}

export const PlaygroundFileUploadForm = memo<PlaygroundFileUploadFormProps>(
  ({ id, propertyKey, type, isOptional, onValueChange, value }) => {
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
    const dragOver: DragEventHandler<HTMLElement> = (e) => {
      e.preventDefault();
      setDrag(true);
    };

    const dragEnter: DragEventHandler<HTMLElement> = (e) => {
      e.preventDefault();
      setDrag(true);
    };

    const dragLeave: DragEventHandler<HTMLElement> = (e) => {
      e.preventDefault();
      setDrag(false);
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

    const fileDrop: DragEventHandler<HTMLElement> = (e) => {
      e.preventDefault();
      setDrag(false);

      const files = e.dataTransfer.files;
      handleChangeFiles(files);
    };

    const handleRemove = () => {
      onValueChange(undefined);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files != null) {
        handleChangeFiles(files);
      }

      // NOTE: the input is not controlled, so we need to clear it manually...
      // every time the user selects a file, we record the change in-state, and then clear the input
      // so that the input can be used again to select the same file
      if (ref.current != null) {
        ref.current.value = "";
      }
    };

    const ref = useRef<HTMLInputElement>(null);
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
          type="file"
          id={id}
          onChange={handleChange}
          className="hidden"
          multiple={type === "files"}
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
          {value == null || value.length === 0 || value[0]?.name == null ? (
            <div className="flex flex-col items-center gap-3 p-6">
              <h5>Drop files here to upload</h5>
              <FernButton
                onClick={() => ref.current?.click()}
                text="Browse files"
                rounded
                variant="outlined"
                intent="primary"
              />
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
                    {type === "file" && (
                      <FernButton
                        text="Change"
                        onClick={() => ref.current?.click()}
                        size="small"
                        variant="minimal"
                      />
                    )}
                    <FernButton
                      icon={<Xmark />}
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
                <div className="flex justify-end p-4">
                  <FernButton
                    onClick={() => ref.current?.click()}
                    icon={<PagePlusIn />}
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
