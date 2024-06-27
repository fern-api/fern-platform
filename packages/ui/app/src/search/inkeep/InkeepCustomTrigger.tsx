import { useEventCallback } from "@fern-ui/react-commons";
import { atom, useAtom } from "jotai";
import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { useSearchTrigger } from "../useSearchTrigger";
import useInkeepSettings from "./useInkeepSettings";

const CustomTrigger = dynamic(() => import("@inkeep/widgets").then((mod) => mod.InkeepCustomTrigger), {
    ssr: false,
});

export const INKEEP_TRIGGER = atom(false);

export function InkeepCustomTrigger(): ReactElement | null {
    const settings = useInkeepSettings();
    const [isOpen, setIsOpen] = useAtom(INKEEP_TRIGGER);

    const handleClose = useEventCallback(() => {
        setIsOpen(false);
    });

    useSearchTrigger(setIsOpen);

    if (settings == null) {
        return null;
    }

    const { baseSettings, aiChatSettings, searchSettings, modalSettings } = settings;

    const customTriggerProps = {
        isOpen,
        onClose: handleClose,
        baseSettings,
        aiChatSettings,
        searchSettings,
        modalSettings,
    };

    return <CustomTrigger {...customTriggerProps} />;
}
