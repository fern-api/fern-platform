import { Cross1Icon, FileIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import numeral from "numeral";
import { ChangeEventHandler, DragEventHandler, memo, useCallback, useRef, useState } from "react";
import { FernButton, FernButtonGroup } from "../../components/FernButton";
import { FernCard } from "../../components/FernCard";
import { WithLabelInternal } from "../WithLabel";

export interface PlaygroundFileUploadFormProps {
    id: string;
    propertyKey: string;
    type: "file" | "fileArray";
    isOptional?: boolean;
    onValueChange: (value: ReadonlyArray<File> | undefined) => void;
    value: ReadonlyArray<File> | undefined;
}

export const PlaygroundFileUploadForm = memo<PlaygroundFileUploadFormProps>(
    ({ id, propertyKey, type, isOptional, onValueChange, value }) => {
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

        const fileDrop: DragEventHandler<HTMLElement> = (e) => {
            e.preventDefault();
            setDrag(false);

            const files = e.dataTransfer.files;
            onValueChange(Array.from(files));
        };
        const handleRemove = useCallback(() => {
            onValueChange(undefined);
        }, [onValueChange]);
        const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
            (e) => {
                onValueChange(e.target.files != null ? Array.from(e.target.files) : undefined);
            },
            [onValueChange],
        );
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
                <input ref={ref} type="file" id={id} onChange={handleChange} className="hidden" />
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
                        <div className="divide-default divide-y px-4 py-2">
                            {value.map((file) => (
                                <div key={file.name} className="flex justify-between">
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <FileIcon />
                                        </div>
                                        <span className="inline-flex items-baseline gap-2">
                                            <span className="text-sm">{file.name}</span>
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
                                            icon={<Cross1Icon />}
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
                            {type === "fileArray" && (
                                <div className="flex justify-end px-4 py-2">
                                    <FernButton
                                        onClick={() => ref.current?.click()}
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
    },
);

PlaygroundFileUploadForm.displayName = "PlaygroundFileUploadForm";
