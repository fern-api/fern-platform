import { RemoteIconClient } from "@fern-docs/components/remote-icon/client";
import {
  ChevronsLeftRight,
  FileText,
  Hash,
  History,
  Webhook,
} from "lucide-react";
import { SVGProps, forwardRef } from "react";

export const PageIcon = forwardRef<
  SVGSVGElement,
  SVGProps<SVGSVGElement> & {
    icon: string | undefined;
    type: string | undefined;
    isSubPage?: boolean;
  }
>(({ icon, type, isSubPage, ...props }, ref) => {
  if (icon) {
    return <RemoteIconClient icon={icon} ref={ref} {...props} />;
  }

  if (type === "changelog") {
    return <History ref={ref} {...props} />;
  }

  if (type === "webhook") {
    return <Webhook ref={ref} {...props} />;
  }

  // if (type === "websocket") {
  //     return <ChevronsLeftRightEllipsis ref={ref} {...props} />;
  // }

  if (type === "http" || type === "webhook" || type === "websocket") {
    return <ChevronsLeftRight ref={ref} {...props} />;
  }

  if (isSubPage) {
    return <Hash ref={ref} {...props} />;
  }

  return <FileText ref={ref} {...props} />;
});

PageIcon.displayName = "PageIcon";
