"use client";

import { ReactElement } from "react";

import * as Switch from "@radix-ui/react-switch";

import { cn } from "./cn";

export function FernSwitch(props: Switch.SwitchProps): ReactElement {
  return (
    <Switch.Root
      {...props}
      className={cn(
        "ring-border-default bg-(color:--grayscale-a3) data-[state=checked]:bg-(color:--accent) relative h-[25px] w-[42px] cursor-default rounded-full ring-1 ring-inset",
        props.className
      )}
      style={{
        WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
        ...props.style,
      }}
      tabIndex={0}
    >
      <Switch.Thumb className="bg-background shadow-border-default block size-[21px] translate-x-0.5 rounded-full shadow-[0_2px_2px] transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
    </Switch.Root>
  );
}
