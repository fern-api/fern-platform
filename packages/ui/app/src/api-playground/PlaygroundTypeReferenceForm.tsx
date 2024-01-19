import { Button, InputGroup, NumericInput, Switch, TextArea } from "@blueprintjs/core";
import { DateInput3 } from "@blueprintjs/datetime2";
import { ArrowLeft } from "@blueprintjs/icons";
import { ResolvedTypeReference } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { Transition } from "@headlessui/react";
import { FC, PropsWithChildren } from "react";
import { renderTypeShorthand } from "../api-page/types/type-shorthand/TypeShorthand";
import { PlaygroundDiscriminatedUnionForm } from "./PlaygroundDescriminatedUnionForm";
import { PlaygroundEnumForm } from "./PlaygroundEnumForm";
import { PlaygroundListForm } from "./PlaygroundListForm";
import { PlaygroundMapForm } from "./PlaygroundMapForm";
import { PlaygroundObjectPropertiesForm } from "./PlaygroundObjectPropertyForm";
import { PlaygroundUniscriminatedUnionForm } from "./PlaygroundUniscriminatedUnionForm";

interface PlaygroundTypeReferenceFormProps {
    shape: ResolvedTypeReference;
    onChange: (value: unknown) => void;
    value?: unknown;
    onFocus?: () => void;
    onBlur?: () => void;
    renderAsPanel?: boolean;
}

interface WithPanelProps {
    value: unknown;
    typeShape: ResolvedTypeReference;
    renderAsPanel: boolean;
}

const WithPanel: FC<PropsWithChildren<WithPanelProps>> = ({ children, value, typeShape, renderAsPanel }) => {
    const { value: isPanelOpen, setTrue: showPanel, setFalse: hidePanel } = useBooleanState(false);
    if (!renderAsPanel) {
        return <>{children}</>;
    }
    return (
        <>
            <div
                onClick={showPanel}
                className="group flex h-full min-h-8 w-full min-w-0 shrink cursor-pointer items-center justify-end"
            >
                <span className="inline-flex flex-1 shrink items-baseline justify-end gap-2 overflow-hidden">
                    <span className="group-hover:bg-tag-default-light dark:group-hover:bg-tag-default-dark -mx-0.5 min-w-0 shrink truncate whitespace-nowrap rounded px-0.5 font-mono text-xs">
                        {JSON.stringify(value)}
                    </span>
                    <span className="t-muted whitespace-nowrap text-xs">{renderTypeShorthand(typeShape)}</span>
                </span>
            </div>
            <Transition
                as="div"
                show={isPanelOpen}
                appear={true}
                enter="ease-out transition-opacity transition-transform"
                enterFrom="opacity-0 translate-x-full"
                enterTo="opacity-100 translate-x-0"
                leave="ease-in transition-opacity transition-transform"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 translate-x-full"
                className="bg-background dark:bg-background-dark scroll-contain absolute inset-0 z-30 overflow-y-auto overflow-x-hidden"
            >
                <div className="bg-background dark:bg-background-dark border-border-default-light dark:border-border-default-dark sticky top-0 z-30 flex h-10 items-center border-b px-2">
                    <Button minimal icon={<ArrowLeft />} text="Back" onClick={hidePanel} />
                </div>
                <div className="p-4">{children}</div>
            </Transition>
        </>
    );
};

export const PlaygroundTypeReferenceForm: FC<PlaygroundTypeReferenceFormProps> = ({
    shape,
    onChange,
    value,
    onBlur: handleBlur,
    onFocus: handleFocus,
    renderAsPanel = false,
}) => {
    return visitDiscriminatedUnion(shape, "type")._visit({
        object: (object) => (
            <WithPanel value={value} typeShape={object} renderAsPanel={renderAsPanel}>
                <PlaygroundObjectPropertiesForm properties={object.properties} onChange={onChange} value={value} />
            </WithPanel>
        ),
        enum: ({ values }) => <PlaygroundEnumForm enumValues={values} onChange={onChange} value={value} />,
        undiscriminatedUnion: (undiscriminatedUnion) => (
            <WithPanel value={value} typeShape={undiscriminatedUnion} renderAsPanel={renderAsPanel}>
                <PlaygroundUniscriminatedUnionForm
                    undiscriminatedUnion={undiscriminatedUnion}
                    onChange={onChange}
                    value={value}
                />
            </WithPanel>
        ),
        discriminatedUnion: (discriminatedUnion) => (
            <WithPanel value={value} typeShape={discriminatedUnion} renderAsPanel={renderAsPanel}>
                <PlaygroundDiscriminatedUnionForm
                    discriminatedUnion={discriminatedUnion}
                    onChange={onChange}
                    value={value}
                />
            </WithPanel>
        ),
        string: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <InputGroup
                    fill={true}
                    value={typeof value === "string" ? value : ""}
                    onValueChange={onChange}
                    rightElement={<span className="t-muted mx-2 flex h-[30px] items-center text-xs">{"string"}</span>}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
            </div>
        ),
        boolean: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <Switch
                    large={true}
                    checked={typeof value === "boolean" ? value : undefined}
                    onChange={(e) => onChange(e.target.checked)}
                    className="-mb-1 -mr-2"
                />
            </div>
        ),
        integer: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <NumericInput
                    fill={true}
                    minorStepSize={null}
                    value={typeof value === "number" ? value : undefined}
                    onValueChange={onChange}
                    rightElement={<span className="t-muted mx-2 flex h-[30px] items-center text-xs">{"integer"}</span>}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
            </div>
        ),
        double: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <NumericInput
                    fill={true}
                    value={typeof value === "number" ? value : undefined}
                    onValueChange={onChange}
                    rightElement={<span className="t-muted mx-2 flex h-[30px] items-center text-xs">{"double"}</span>}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
            </div>
        ),
        long: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <NumericInput
                    fill={true}
                    minorStepSize={null}
                    value={typeof value === "number" ? value : undefined}
                    onValueChange={onChange}
                    rightElement={<span className="t-muted mx-2 flex h-[30px] items-center text-xs">{"long"}</span>}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
            </div>
        ),
        datetime: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <DateInput3
                    fill={true}
                    placeholder="MM/DD/YYYY"
                    timePrecision="millisecond"
                    value={typeof value === "string" ? value : undefined}
                    onChange={onChange}
                    inputProps={{
                        onFocus: handleFocus,
                        onBlur: handleBlur,
                    }}
                />
            </div>
        ),
        uuid: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <InputGroup
                    fill={true}
                    value={typeof value === "string" ? value : ""}
                    onValueChange={onChange}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    rightElement={<span className="t-muted mx-2 flex h-[30px] items-center text-xs">{"uuid"}</span>}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
            </div>
        ),
        base64: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <TextArea
                    fill={true}
                    value={typeof value === "string" ? value : ""}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
            </div>
        ),
        date: () => (
            <div className="flex min-w-0 flex-1 justify-end">
                <DateInput3
                    fill={true}
                    placeholder="MM/DD/YYYY"
                    value={typeof value === "string" ? value : undefined}
                    onChange={onChange}
                    inputProps={{
                        onFocus: handleFocus,
                        onBlur: handleBlur,
                    }}
                />
            </div>
        ),
        optional: () => null, // should be handled by the parent
        list: (list) => <PlaygroundListForm itemShape={list.shape} onChange={onChange} value={value} />,
        set: (set) => <PlaygroundListForm itemShape={set.shape} onChange={onChange} value={value} />,
        map: (map) => (
            <PlaygroundMapForm keyShape={map.keyShape} valueShape={map.valueShape} onChange={onChange} value={value} />
        ),
        stringLiteral: (literal) => (
            <div>
                <span>{literal.value ? "TRUE" : "FALSE"}</span>
            </div>
        ),
        booleanLiteral: (literal) => (
            <div>
                <span>{literal.value}</span>
            </div>
        ),
        unknown: () => (
            <TextArea
                fill={true}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => onChange(e.target.value)}
            />
        ),
        _other: () => null,
    });
};
