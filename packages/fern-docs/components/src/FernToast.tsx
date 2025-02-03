import { CheckCircle2, CircleAlert, CircleX, Info, Loader } from "lucide-react";
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
        success: <CheckCircle2 className="size-icon text-text-muted" />,
        info: <Info className="size-icon text-text-muted" />,
        warning: <CircleAlert className="size-icon text-text-muted" />,
        error: <CircleX className="size-icon text-text-muted" />,
        loading: <Loader className="size-icon text-text-muted animate-spin" />,
      }}
    />
  );
};
