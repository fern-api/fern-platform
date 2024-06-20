import { FernSegmentedControl } from "@fern-ui/components";
import { FC, PropsWithChildren } from "react";
import { AppleShortcuts } from "../../icons/apple-shortcuts";
import { RadioSignal } from "../../icons/radio-signal";

export declare namespace StreamingEnabledToggle {
    export interface Props {
        value: boolean;
        setValue: (enabled: boolean) => void;
        className?: string;
    }
}

// const STREAMING_ENABLED = "Streaming enabled";
// const STREAMING_DISABLED = "Streaming disabled";

// const SELECT_ITEM_CLSX =
//     "text-text-default data-[disabled]:text-text-disabled relative flex h-8 select-none items-center rounded-[5px] pl-[25px] pr-[35px] text-sm leading-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-contrast";

export const StreamingEnabledToggle: FC<PropsWithChildren<StreamingEnabledToggle.Props>> = ({
    value,
    setValue,
    className,
}) => {
    // return (
    //     <Select.Root onValueChange={(e) => setValue(e === "true")} value={value ? "true" : "false"}>
    //         <Select.Trigger asChild={true}>
    //             <FernButton
    //                 variant="filled"
    //                 icon={<Activity />}
    //                 rightIcon={
    //                     <Select.Icon>
    //                         <ChevronDownIcon />
    //                     </Select.Icon>
    //                 }
    //                 intent="primary"
    //             >
    //                 <Select.Value>{value ? STREAMING_ENABLED : STREAMING_DISABLED}</Select.Value>
    //             </FernButton>
    //         </Select.Trigger>
    //         <Select.Portal>
    //             <Select.Content className="overflow-hidden rounded-lg bg-card backdrop-blur shadow-2xl ring-default ring-inset ring-1 z-50">
    //                 <Select.ScrollUpButton />
    //                 <Select.Viewport className="p-[5px]">
    //                     <Select.Item value="true" className={SELECT_ITEM_CLSX}>
    //                         <Select.ItemText>{STREAMING_ENABLED}</Select.ItemText>
    //                         <Select.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
    //                             <CheckIcon />
    //                         </Select.ItemIndicator>
    //                     </Select.Item>
    //                     <Select.Item value="false" className={SELECT_ITEM_CLSX}>
    //                         <Select.ItemText>{STREAMING_DISABLED}</Select.ItemText>
    //                         <Select.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
    //                             <CheckIcon />
    //                         </Select.ItemIndicator>
    //                     </Select.Item>
    //                 </Select.Viewport>
    //                 <Select.ScrollDownButton />
    //             </Select.Content>
    //         </Select.Portal>
    //     </Select.Root>
    // );

    return (
        <FernSegmentedControl
            options={[
                { type: "value", value: "batch", label: "Batch", icon: <AppleShortcuts /> },
                { type: "value", value: "stream", label: "Stream", icon: <RadioSignal /> },
            ]}
            onValueChange={(value) => {
                setValue(value === "stream");
            }}
            value={value ? "stream" : "batch"}
            className={className}
        />
    );
};
