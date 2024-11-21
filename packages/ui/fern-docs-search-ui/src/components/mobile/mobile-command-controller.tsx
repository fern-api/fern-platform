import { useSearch } from "@/hooks/useSearch";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import { forwardRef } from "react";
import { MobileCommand, MobileCommandProps } from "./mobile-command";

export const MobileCommandController = forwardRef<HTMLDivElement, MobileCommandProps>((props, ref) => {
    const searchProps = useSearch({ filters: props.filters ?? EMPTY_ARRAY });
    return <MobileCommand {...props} {...searchProps} ref={ref} />;
});

MobileCommandController.displayName = "MobileCommandController";
