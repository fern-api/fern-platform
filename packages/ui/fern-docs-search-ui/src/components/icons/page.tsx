import { FileText, History } from "lucide-react";
import { SVGProps, forwardRef } from "react";
import { RemoteIcon } from "./remote";

export const PageIcon = forwardRef<
    SVGSVGElement,
    SVGProps<SVGSVGElement> & { icon: string | undefined; type: string | undefined }
>(({ icon, type, ...props }, ref) => {
    if (icon) {
        return <RemoteIcon icon={icon} ref={ref} {...props} />;
    }

    if (type === "changelog") {
        return <History ref={ref} {...props} />;
    }

    return <FileText ref={ref} {...props} />;
});

PageIcon.displayName = "PageIcon";
