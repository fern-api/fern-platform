import { ComponentPropsWithoutRef, forwardRef } from "react";

export const Chevron = forwardRef<
  SVGSVGElement,
  ComponentPropsWithoutRef<"svg">
>(({ ...props }, ref) => {
  return (
    <svg
      {...props}
      ref={ref}
      fill="none"
      height="16"
      viewBox="0 0 15 15"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 11L6 4L10.5 7.5L6 11Z" fill="currentColor"></path>
    </svg>
  );
});

Chevron.displayName = "Chevron";
