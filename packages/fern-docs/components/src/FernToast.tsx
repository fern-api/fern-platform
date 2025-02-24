"use client";

import { AlertCircle, CheckCircle, Info, Loader2, XCircle } from "lucide-react";
import { Toaster as SonnerToaster } from "sonner";

export { toast } from "sonner";
export type { ToastT } from "sonner";

interface ToasterProps {
  // Sonner doesn't export this type or it's props, so we're manually copying them over
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
}

export const Toaster: React.FC<ToasterProps> = ({
  position = "bottom-center",
}: ToasterProps) => {
  return (
    <SonnerToaster
      position={position}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "rounded-2 border border-border-default bg-background w-full flex items-start p-2 pl-3 shadow-xl",
          title: "text-body-text text-sm font-medium",
          description: "text-(color:--grayscale-a11) text-sm",
          icon: "flex items-center justify-center mt-[2px]",
        },
      }}
      icons={{
        success: (
          <CheckCircle className="size-icon text-(color:--grayscale-a11)" />
        ),
        info: <Info className="size-icon text-(color:--grayscale-a11)" />,
        warning: (
          <AlertCircle className="size-icon text-(color:--grayscale-a11)" />
        ),
        error: <XCircle className="size-icon text-(color:--grayscale-a11)" />,
        loading: (
          <Loader2 className="size-icon text-(color:--grayscale-a11) animate-spin" />
        ),
      }}
    />
  );
};
