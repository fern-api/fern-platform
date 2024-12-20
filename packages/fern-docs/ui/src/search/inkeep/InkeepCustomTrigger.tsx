import { useEventCallback } from "@fern-ui/react-commons";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { SEARCH_DIALOG_OPEN_ATOM } from "../../atoms";
import useInkeepSettings from "./useInkeepSettings";

const CustomTrigger = dynamic(
  () => import("@inkeep/widgets").then((mod) => mod.InkeepCustomTrigger),
  {
    ssr: false,
  }
);

export function InkeepCustomTrigger(): ReactElement | null {
  const settings = useInkeepSettings();
  const [isOpen, setIsOpen] = useAtom(SEARCH_DIALOG_OPEN_ATOM);

  const handleClose = useEventCallback(() => {
    setIsOpen(false);
  });

  if (settings == null) {
    return null;
  }

  const { baseSettings, aiChatSettings, searchSettings, modalSettings } =
    settings;

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
