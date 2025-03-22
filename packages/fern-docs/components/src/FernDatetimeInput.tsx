import { ComponentProps, forwardRef } from "react";

import { format } from "date-fns";

import { FernInput } from "./FernInput";

export interface FernDatetimeInputProps extends ComponentProps<"input"> {
  inputClassName?: string;
  onValueChange?: (value: string) => void;
  resettable?: boolean;
  value?: string;
  defaultValue?: string;
}

/**
 * Formats a date string to the format expected by the input element, in local time.
 *
 * @param date - The date string to format into local time.
 * @returns The formatted date string in local time for the input element.
 */
function formatInputDate(date: string) {
  try {
    if (date === "currentDate") {
      return format(new Date(), "yyyy-MM-dd'T'HH:mm");
    }
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
  } catch (_error) {
    console.warn(`Invalid date format: ${date}. Defaulting to current date.`);
    return format(new Date(), "yyyy-MM-dd'T'HH:mm");
  }
}

/**
 * Converts a date string to a UTC date string for use with downstream elements, like the playground.
 *
 * @param date - The date string to convert.
 * @returns The UTC date string.
 */
function utcDate(date: string) {
  return new Date(date).toISOString();
}

export const FernDatetimeInput = forwardRef<
  HTMLInputElement,
  FernDatetimeInputProps
>(({ value, defaultValue, onValueChange, ...props }, ref) => {
  return (
    <FernInput
      {...props}
      type="datetime-local"
      value={typeof value === "string" ? formatInputDate(value) : undefined}
      onValueChange={(value) => {
        onValueChange?.(utcDate(value));
      }}
      ref={ref}
    />
  );
});

FernDatetimeInput.displayName = "FernDatetimeInput";
