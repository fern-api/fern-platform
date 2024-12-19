import * as Switch from "@radix-ui/react-switch";
import cn from "clsx";
import { ReactElement } from "react";

export function FernSwitch(props: Switch.SwitchProps): ReactElement {
  return (
    <Switch.Root
      {...props}
      className={cn(
        "ring-default relative h-[25px] w-[42px] cursor-default rounded-full bg-tag-default ring-1 ring-inset data-[state=checked]:bg-accent",
        props.className
      )}
      style={{
        WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
        ...props.style,
      }}
      tabIndex={0}
    >
      <Switch.Thumb className="block size-[21px] translate-x-0.5 rounded-full bg-background shadow-[0_2px_2px] shadow-border-default transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
    </Switch.Root>
  );
}
