import { useSearch } from "@/hooks/useSearch";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import { forwardRef } from "react";
import { DesktopCommand, DesktopCommandProps } from "./desktop-command";

export const DesktopCommandController = forwardRef<HTMLDivElement, DesktopCommandProps>((props, ref) => {
    const searchProps = useSearch({ filters: props.filters ?? EMPTY_ARRAY });
    return <DesktopCommand {...props} {...searchProps} ref={ref} />;
});

DesktopCommandController.displayName = "DesktopCommandController";
