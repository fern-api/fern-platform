import {
  CheckCircle,
  InfoCircle,
  SystemRestart,
  WarningCircle,
  XmarkCircle,
} from "iconoir-react";
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
            "rounded-lg border border-default bg-background w-full flex items-start p-2 pl-3 shadow-xl",
          title: "text-body-text text-sm font-medium",
          description: "text-muted text-sm",
          icon: "flex items-center justify-center mt-[2px]",
        },
      }}
      icons={{
        success: <CheckCircle className="size-icon text-text-muted" />,
        info: <InfoCircle className="size-icon text-text-muted" />,
        warning: <WarningCircle className="size-icon text-text-muted" />,
        error: <XmarkCircle className="size-icon text-text-muted" />,
        loading: (
          <SystemRestart className="size-icon text-text-muted animate-spin" />
        ),
      }}
    />
  );
};
