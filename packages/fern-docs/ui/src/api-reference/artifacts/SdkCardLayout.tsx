import cn from "clsx";
import { ReactElement, useMemo } from "react";

export declare namespace SdkCardLayout {
  export interface Props {
    icon: ReactElement;
    title: ReactElement | string;
    subtitle?: ReactElement | string;
    rightElement?: ReactElement;
    href?: string;
  }
}

export const SdkCardLayout: React.FC<SdkCardLayout.Props> = ({
  icon,
  title,
  subtitle,
  rightElement,
  href,
}) => {
  const onClick = useMemo(() => {
    if (href == null) {
      return undefined;
    }
    return () => {
      window.open(href, "_blank", "noopener");
    };
  }, [href]);

  return (
    <div
      className={cn(
        "flex h-[120px] items-center justify-between rounded-xl border border-neutral-700 bg-neutral-800/20 px-5 py-8",
        {
          "cursor-pointer hover:bg-neutral-800/50": onClick != null,
        }
      )}
      onClick={onClick}
    >
      <div className="flex">
        <div className="mr-5 text-neutral-200">{icon}</div>
        <div className="flex flex-col justify-center gap-px">
          <div className="text-lg font-medium text-neutral-200">{title}</div>
          <div className="t-muted">{subtitle}</div>
        </div>
      </div>
      {rightElement}
    </div>
  );
};
