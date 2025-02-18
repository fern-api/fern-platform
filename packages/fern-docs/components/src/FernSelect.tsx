import { FC, forwardRef } from "react";

import * as Select from "@radix-ui/react-select";
import { Check, NavArrowDown, NavArrowUp } from "iconoir-react";

import { cn } from "./cn";

export const FernSelect: FC<Select.SelectProps> = () => (
  <Select.Root>
    <Select.Trigger
      className="text-violet11 hover:bg-mauve3 data-[placeholder]:text-violet9 px-icon inline-flex h-[35px] items-center justify-center gap-[5px] rounded bg-white text-[13px] leading-none shadow-[0_2px_10px] shadow-black/10 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
      aria-label="Food"
    >
      <Select.Value placeholder="Select a fruit…" />
      <Select.Icon className="text-violet11">
        <NavArrowDown className="size-icon" />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className="overflow-hidden rounded-md bg-white shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
        <Select.ScrollUpButton className="text-violet11 flex h-[25px] cursor-default items-center justify-center bg-white">
          <NavArrowUp className="size-icon" />
        </Select.ScrollUpButton>
        <Select.Viewport className="p-[5px]">
          <Select.Group>
            <Select.Label className="text-mauve11 px-[25px] text-xs leading-[25px]">
              Fruits
            </Select.Label>
            <FernSelectItem value="apple">Apple</FernSelectItem>
            <FernSelectItem value="banana">Banana</FernSelectItem>
            <FernSelectItem value="blueberry">Blueberry</FernSelectItem>
            <FernSelectItem value="grapes">Grapes</FernSelectItem>
            <FernSelectItem value="pineapple">Pineapple</FernSelectItem>
          </Select.Group>

          <Select.Separator className="bg-violet6 m-[5px] h-px" />

          <Select.Group>
            <Select.Label className="text-mauve11 px-[25px] text-xs leading-[25px]">
              Vegetables
            </Select.Label>
            <FernSelectItem value="aubergine">Aubergine</FernSelectItem>
            <FernSelectItem value="broccoli">Broccoli</FernSelectItem>
            <FernSelectItem value="carrot" disabled>
              Carrot
            </FernSelectItem>
            <FernSelectItem value="courgette">Courgette</FernSelectItem>
            <FernSelectItem value="leek">Leek</FernSelectItem>
          </Select.Group>

          <Select.Separator className="bg-violet6 m-[5px] h-px" />

          <Select.Group>
            <Select.Label className="text-mauve11 px-[25px] text-xs leading-[25px]">
              Meat
            </Select.Label>
            <FernSelectItem value="beef">Beef</FernSelectItem>
            <FernSelectItem value="chicken">Chicken</FernSelectItem>
            <FernSelectItem value="lamb">Lamb</FernSelectItem>
            <FernSelectItem value="pork">Pork</FernSelectItem>
          </Select.Group>
        </Select.Viewport>
        <Select.ScrollDownButton className="text-violet11 flex h-[25px] cursor-default items-center justify-center bg-white">
          <NavArrowDown className="size-icon" />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

export const FernSelectItem = forwardRef<
  HTMLDivElement,
  Select.SelectItemProps
>(function FernSelectItem({ children, className, ...props }, forwardedRef) {
  return (
    <Select.Item
      className={cn(
        "text-violet11 data-[disabled]:text-mauve8 data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1 relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[35px] text-[13px] leading-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none",
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
        <Check />
      </Select.ItemIndicator>
    </Select.Item>
  );
});
