import * as Switch from "@radix-ui/react-switch";
import classNames from "classnames";
import { ReactElement } from "react";

export function FernSwitch(props: Switch.SwitchProps): ReactElement {
    return (
        <Switch.Root
            {...props}
            className={classNames(
                "relative h-[25px] w-[42px] cursor-default rounded-full bg-tag-primary ring-1 ring-inset ring-border-primary data-[state=checked]:bg-accent focus:outline-4 !outline-offset-0 focus:outline-tag-primary",
                props.className,
            )}
            style={{ WebkitTapHighlightColor: "rgba(0, 0, 0, 0)", ...props.style }}
        >
            <Switch.Thumb className="bg-background shadow-border-default block h-[21px] w-[21px] translate-x-0.5 rounded-full shadow-[0_2px_2px] transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
        </Switch.Root>
    );
}
