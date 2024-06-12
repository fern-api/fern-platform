import { FC } from "react";
import { AlertCircle, CheckCircle, Info, Loader, XCircle } from "react-feather";
import { Toaster as SonnerToaster } from "sonner";

export { toast } from "sonner";
export type { ToastT } from "sonner";

interface ToasterProps {
    // Sonner doesn't export this type or it's props, so we're manually copying them over
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
}

export const Toaster: FC<ToasterProps> = ({ position }) => {
    return (
        <SonnerToaster
            position={position ?? "bottom-center"}
            toastOptions={{
                unstyled: true,
                classNames: {
                    toast: "rounded-lg border border-default bg-background w-full flex items-start p-2 pl-3 shadow-xl",
                    title: "text-body-text text-sm font-medium",
                    description: "text-muted text-sm",
                    icon: "flex items-center justify-center mt-[2px]",
                },
            }}
            icons={{
                success: <CheckCircle className="size-3.5 text-text-muted" />,
                info: <Info className="size-3.5 text-text-muted" />,
                warning: <AlertCircle className="size-3.5 text-text-muted" />,
                error: <XCircle className="size-3.5 text-text-muted" />,
                loading: <Loader className="animate-spin size-3.5 text-text-muted" />,
            }}
        />
    );
};
